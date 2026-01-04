//orchastrator
import { DiceRoll, GameState } from "../types/game";
import { rollDice } from "./dice";
import { resolveCurrentTile } from "./resolveTile";
import { endTurn } from "./turn";
import { movePlayer } from "./move";
import { getCurrentPlayerSafe } from "./assertions";

export function playTurn(state: GameState, dice: DiceRoll): GameState {
  let nextState = { ...state }; //shallow copy->
  const player = getCurrentPlayerSafe(nextState);
  const events = [...nextState.events]; //to append the new event later

  events.push({ type: "DICE_ROLLED", dice });

  // 🚔 JAIL LOGIC
  if (player.inJail) {
    const isDouble = dice.die1 === dice.die2;

    if (isDouble) {
      player.inJail = false;
      player.jailTurns = 0;
      events.push({ type: "JAIL_EXITED", reason: "DOUBLES" });
      nextState = movePlayer(nextState, dice);
    } else {
      player.jailTurns += 1;
      events.push({
        type: "JAIL_TURN_FAILED",
        attempt: player.jailTurns,
      });

      if (player.jailTurns >= 3) {
        player.inJail = false;
        player.jailTurns = 0;
        events.push({ type: "JAIL_EXITED", reason: "MAX_TURNS" });
        nextState = movePlayer(nextState, dice);
      }
    }
  } else {
    nextState = movePlayer(nextState, dice);
  }
  nextState = resolveCurrentTile(nextState);
  nextState = endTurn(nextState);

  return {
    ...nextState,
    events,
  };
}
