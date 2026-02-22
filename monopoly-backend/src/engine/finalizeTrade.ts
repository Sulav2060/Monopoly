import { PropertyTile } from "../types/board";
import { GameState } from "../types/game";
import { BOARD } from "./board";

/**
 * Finalize a trade by accepting it
 * Transfers money and properties between players
 */
export function acceptTrade(state: GameState, tradeId: string): GameState {
  try {
    // Find the trade offer by tradeId
    const tradeOffer = (state.pendingTrades || []).find(
      (trade) => trade.tradeId === tradeId,
    );

    if (!tradeOffer) {
      console.error(`❌ No pending trade offer with ID: ${tradeId}`);
      return state;
    }

    const tradeData = tradeOffer;

    const initiatingPlayer = state.players.find(
      (p) => p.id === tradeData.initiatingPlayerId,
    );
    const targetPlayer = state.players.find(
      (p) => p.id === tradeData.targetPlayerId,
    );

    if (!initiatingPlayer || !targetPlayer) {
      console.error("❌ Player not found");
      return state;
    }

    //check all the properties are of type PROPERTY
    for (const tileIndex of [
      ...tradeData.offerProperties,
      ...tradeData.requestProperties,
    ]) {
      const tile = BOARD[tileIndex];
      if (tile?.type !== "PROPERTY") {
        console.error(`❌ Tile ${tileIndex} is not a property`);
        return state;
      }
    }

    // Final validation: check players still have the resources
    if (initiatingPlayer.money < tradeData.offerMoney) {
      console.error("❌ Initiating player no longer has enough money");
      return state;
    }

    if (targetPlayer.money < tradeData.requestMoney) {
      console.error("❌ Target player no longer has enough money");
      return state;
    }

    // Validate properties still owned by correct players
    for (const tileIndex of tradeData.offerProperties) {
      const property = state.properties.find((p) => p.tileIndex === tileIndex);
      if (!property || property.ownerId !== tradeData.initiatingPlayerId) {
        console.error(
          `❌ Property ${tileIndex} no longer owned by initiating player`,
        );
        return state;
      }
    }

    for (const tileIndex of tradeData.requestProperties) {
      const property = state.properties.find((p) => p.tileIndex === tileIndex);
      if (!property || property.ownerId !== tradeData.targetPlayerId) {
        console.error(
          `❌ Property ${tileIndex} no longer owned by target player`,
        );
        return state;
      }
    }

    //check if none of the properties involved have houses built in them, if they do we should reject the trade as we don't want to allow trading of properties with houses on them
    for (const tileIndex of [
      ...tradeData.offerProperties,
      ...tradeData.requestProperties,
    ]) {
      const property = state.properties.find((p) => p.tileIndex === tileIndex);
      if (property && property.houses > 0) {
        const propertyTile = BOARD[tileIndex] as PropertyTile;
        const tileName = propertyTile.name;
        console.error(`❌ Property ${tileName} has houses built on it`);
        return state;
      }
    }
    //TODO: Maybe we need to add a stop for all the processes during the trade accept(finalization) for changing property values and for concurrency
    // Execute the trade: transfer money and properties
    return {
      ...state,
      players: state.players.map((p) => {
        if (p.id === tradeData.initiatingPlayerId) {
          return {
            ...p,
            money: p.money - tradeData.offerMoney + tradeData.requestMoney,
          };
        }
        if (p.id === tradeData.targetPlayerId) {
          return {
            ...p,
            money: p.money + tradeData.offerMoney - tradeData.requestMoney,
          };
        }
        return p;
      }),
      properties: state.properties.map((prop) => {
        // Transfer offered properties to target
        if (tradeData.offerProperties.includes(prop.tileIndex)) {
          return {
            ...prop,
            ownerId: tradeData.targetPlayerId,
          };
        }
        // Transfer requested properties to initiator
        if (tradeData.requestProperties.includes(prop.tileIndex)) {
          return {
            ...prop,
            ownerId: tradeData.initiatingPlayerId,
          };
        }
        return prop;
      }),
      pendingTrades: (state.pendingTrades || []).filter(
        (trade) => trade !== tradeOffer,
      ),
      events: [
        ...state.events,
        {
          type: "TRADE_ACCEPTED",
          tradeId: tradeData.tradeId,
          initiatingPlayerId: tradeData.initiatingPlayerId,
          targetPlayerId: tradeData.targetPlayerId,
          offerMoney: tradeData.offerMoney,
          offerProperties: tradeData.offerProperties,
          requestMoney: tradeData.requestMoney,
          requestProperties: tradeData.requestProperties,
        },
      ],
    };
  } catch (error) {
    console.error("❌ Error in acceptTrade:", error);
    return state;
  }
}

/**
 * Finalize a trade by rejecting it
 * Clears the pending trade action
 */
export function rejectTrade(state: GameState, tradeId: string): GameState {
  try {
    // Find the trade offer by tradeId
    const tradeOffer = (state.pendingTrades || []).find(
      (trade) => trade.tradeId === tradeId,
    );

    if (!tradeOffer) {
      console.error(`❌ No pending trade offer with ID: ${tradeId}`);
      return state;
    }

    const tradeData = tradeOffer;

    // Remove trade from pending trades and add rejected event
    return {
      ...state,
      pendingTrades: (state.pendingTrades || []).filter(
        (trade) => trade !== tradeOffer,
      ),
      events: [
        ...state.events,
        {
          type: "TRADE_REJECTED",
          tradeId: tradeData.tradeId,
          initiatingPlayerId: tradeData.initiatingPlayerId,
          targetPlayerId: tradeData.targetPlayerId,
        },
      ],
    };
  } catch (error) {
    console.error("❌ Error in rejectTrade:", error);
    return state;
  }
}

/**
 * Delete a trade by the player who initiated it
 * Only the initiating player can delete their own trade offer
 */
export function deleteTrade(
  state: GameState,
  tradeId: string,
  playerId: string,
): GameState {
  try {
    // Find the trade offer by tradeId
    const tradeOffer = (state.pendingTrades || []).find(
      (trade) => trade.tradeId === tradeId,
    );

    if (!tradeOffer) {
      console.error(`❌ No pending trade offer with ID: ${tradeId}`);
      return state;
    }

    // Verify that only the initiating player can delete the trade
    if (tradeOffer.initiatingPlayerId !== playerId) {
      console.error(
        `❌ Only the initiating player can delete their trade. Player ${playerId} is not the initiator.`,
      );
      return state;
    }

    const tradeData = tradeOffer;

    // Remove trade from pending trades and add cancelled event
    return {
      ...state,
      pendingTrades: (state.pendingTrades || []).filter(
        (trade) => trade !== tradeOffer,
      ),
      events: [
        ...state.events,
        {
          type: "TRADE_CANCELLED",
          tradeId: tradeData.tradeId,
          initiatingPlayerId: tradeData.initiatingPlayerId,
          targetPlayerId: tradeData.targetPlayerId,
        },
      ],
    };
  } catch (error) {
    console.error("❌ Error in deleteTrade:", error);
    return state;
  }
}
