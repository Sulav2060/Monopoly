import { GameState } from "../types/game"
import { getCurrentPlayerSafe } from "./assertions"

export function payRent(
  state: GameState,
  ownerId: string,
  amount: number
): GameState {
  const player = getCurrentPlayerSafe(state)

  return {
    ...state,
    players: state.players.map(p => {
      if (p.id === player.id) {
        return { ...p, money: p.money - amount }
      }
      if (p.id === ownerId) {
        return { ...p, money: p.money + amount }
      }
      return p
    }),
    events: [
      ...state.events,
      { type: "RENT_PAID", amount }
    ]
  }
}
