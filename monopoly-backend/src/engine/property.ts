import { GameState } from "../types/game"
import { PropertyTile } from "../types/board"
import { getCurrentPlayerSafe } from "./assertions"
import { payRent } from "./rent"

export function handleProperty(
  state: GameState,
  tile: PropertyTile
): GameState {
  const player = getCurrentPlayerSafe(state)

  const owned = state.properties.find(
    p => p.tileIndex === player.position
  )

  // Not owned → auto-buy (for now)
  if (!owned && player.money >= tile.price) {
    return {
      ...state,
      players: state.players.map(p =>
        p.id === player.id
          ? { ...p, money: p.money - tile.price }
          : p
      ),
      properties: [
        ...state.properties,
        { tileIndex: player.position, ownerId: player.id }
      ],
      events: [
        ...state.events,
        { type: "PROPERTY_BOUGHT", tile: tile.name }
      ]
    }
  }

  // Owned by someone else → pay rent
  if (owned && owned.ownerId !== player.id) {
    return payRent(state, owned.ownerId, tile.rent)
  }

  return state
}
