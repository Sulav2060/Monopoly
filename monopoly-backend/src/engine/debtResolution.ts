import { GameState, PlayerId } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { bankruptPlayer } from "./bankruptPlayer";
import { endTurn } from "./endTurn";

/**
 * Check if player can recover from debt
 * - Can recover if they have at least one unmortgaged property (can trade/mortgage it)
 * - Cannot recover if all properties are mortgaged or they have no properties
 */
export function canRecover(state: GameState, playerId: PlayerId): boolean {
  const playerProperties = state.properties.filter(
    (p) => p.ownerId === playerId,
  );

  // Check if player has at least one unmortgaged property
  return playerProperties.some((p) => !p.isMortaged);
}

/**
 * Enter debt resolution state
 * - Set player's debtResolution state with amount and creditor info
 * - Emit DEBT_RESOLUTION_ENTERED event
 */
export function enterDebtResolution(
  state: GameState,
  playerId: PlayerId,
  amount: number,
  creditorId: PlayerId,
): GameState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId
        ? {
            ...p,
            debtResolution: {
              type: "DEBT_RESOLUTION",
              amount,
              creditorId,
            },
          }
        : p,
    ),
    events: [
      ...state.events,
      {
        type: "DEBT_RESOLUTION_ENTERED",
        playerId,
        amount,
        creditorId,
      },
    ],
  };
}

/**
 * Settle debt and remove debt resolution state
 * - Transfer money from debtor to creditor
 * - Remove debtResolution state from player
 * - Emit RENT_PAID event (now that debt is actually being paid)
 * - Emit DEBT_RESOLVED event
 */
export function settleDebt(state: GameState, playerId: PlayerId): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || !player.debtResolution) return state;

  const { amount, creditorId } = player.debtResolution;

  // Transfer money: debtor pays creditor
  const updatedState = {
    ...state,
    players: state.players.map((p) => {
      const { debtResolution, ...playerWithRemovedDebtResolution } = p;
      if (p.id === playerId) {
        // Debtor pays the debt
        return {
          ...playerWithRemovedDebtResolution,
          money: p.money - amount,
          debtResolution: undefined, // Remove debt resolution state
        };
      }
      if (p.id === creditorId) {
        // Creditor receives the payment
        return { ...p, money: p.money + amount };
      }
      return p;
    }),
    events: [
      ...state.events,
      {
        type: "RENT_PAID",
        from: playerId,
        to: creditorId,
        amount,
      } as const,
      {
        type: "DEBT_RESOLVED",
        playerId,
        amount,
        creditorId,
      } as const, // TODO: WHY does not using as const give error???Research and study
    ],
  };

  return updatedState;
}

/**
 * Check debt status after asset changes (mortgage, unmortgage, break houses)
 * - If player has debtResolution state:
 *   - If money >= 0: settle debt and remove debtResolution
 *   - If money < 0 and can't recover: bankrupt player
 *   - Otherwise: stay in debtResolution
 */
export function afterAssetChange(state: GameState): GameState {
  const player = getCurrentPlayerSafe(state);

  // Not in debt resolution, nothing to check
  if (!player.debtResolution) return state;

  const { creditorId } = player.debtResolution;

  // Player has enough money to pay off debt
  if (player.money >= 0) {
    return settleDebt(state, player.id);
  }

  // Player can't recover - bankrupt them and end their turn
  if (!canRecover(state, player.id)) {
    const bankruptState = bankruptPlayer(state, player.id, creditorId);
    return endTurn(bankruptState);
  }

  // Still in debt, but can potentially recover - stay in debtResolution
  return state;
}
