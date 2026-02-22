import { GameState, TradeOfferData } from "../types/game";
import { randomUUID } from "crypto";

/**
 * Initiate a trade offer between two players
 * Creates a pending trade action and adds a trade offered event
 */
export function initiateTrade(
  state: GameState,
  initiatingPlayerId: string,
  targetPlayerId: string,
  offerMoney: number,
  offerProperties: number[],
  requestMoney: number,
  requestProperties: number[],
): GameState {
  try {
    // Validate both players exist
    const initiatingPlayer = state.players.find(
      (p) => p.id === initiatingPlayerId,
    );
    const targetPlayer = state.players.find((p) => p.id === targetPlayerId);

    if (!initiatingPlayer) {
      console.error("❌ Initiating player not found");
      return state;
    }

    if (!targetPlayer) {
      console.error("❌ Target player not found");
      return state;
    }

    // Validate initiating player has enough money to offer
    if (initiatingPlayer.money < offerMoney) {
      console.error("❌ Initiating player has insufficient funds to offer");
      return state;
    }

    // Validate target player has enough money if money is requested
    if (targetPlayer.money < requestMoney) {
      console.error("❌ Target player has insufficient funds");
      return state;
    }

    // Validate initiating player owns all offered properties
    for (const tileIndex of offerProperties) {
      const property = state.properties.find((p) => p.tileIndex === tileIndex);
      if (!property || property.ownerId !== initiatingPlayerId) {
        console.error(
          `❌ Initiating player does not own property ${tileIndex}`,
        );
        return state;
      }
    }

    // Validate target player owns all requested properties
    for (const tileIndex of requestProperties) {
      const property = state.properties.find((p) => p.tileIndex === tileIndex);
      if (!property || property.ownerId !== targetPlayerId) {
        console.error(`❌ Target player does not own property ${tileIndex}`);
        return state;
      }
    }

    // Create trade offer data with unique ID
    const tradeId = randomUUID();
    const tradeData: TradeOfferData = {
      tradeId,
      initiatingPlayerId,
      targetPlayerId,
      offerMoney,
      offerProperties,
      requestMoney,
      requestProperties,
    };

    // Add trade to pending trades array
    return {
      ...state,
      pendingTrades: [...(state.pendingTrades || []), tradeData],
      events: [
        ...state.events,
        {
          type: "TRADE_OFFERED",
          tradeId,
          initiatingPlayerId,
          targetPlayerId,
          offerMoney,
          offerProperties,
          requestMoney,
          requestProperties,
        },
      ],
    };
  } catch (error) {
    console.error("❌ Error in initiateTrade:", error);
    return state;
  }
}
