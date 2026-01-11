import { GameState } from "../types/game"
import { getCurrentPlayerSafe } from "./assertions"

export function handleFreeParking(state: GameState): GameState {
  const player = getCurrentPlayerSafe(state)
  const pot = state.freeParkingPot ?? 0

  if (pot === 0) return state

  return {
    ...state,
    freeParkingPot: 0,
    players: state.players.map(p =>
      p.id === player.id
        ? { ...p, money: p.money + pot }
        : p
    ),
    events: [
      ...state.events,
      { type: "FREE_PARKING_COLLECTED", playerId: player.id, amount: pot }
    ]
  }
}
