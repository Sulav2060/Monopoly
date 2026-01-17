//orchastraetor
import { DiceRoll, GameState } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";
import { endTurn } from "./endTurn";
import { checkGameOver } from "./gameOver";
import { goToJail } from "./goToJail";
import { movePlayer } from "./move";
import { resolveCurrentTile } from "./resolveTile";

export function playTurn(state: GameState, dice: DiceRoll): GameState {
  let nextState = state;

  const isDouble = dice.die1 === dice.die2;
  let doublesCount = isDouble ? (state.doublesCount ?? 0) + 1 : 0;

  // Record dice roll
  nextState = {
    ...nextState,
    lastDice: dice,
    events: [...nextState.events, { type: "DICE_ROLLED", dice }],
  };

  const player = getCurrentPlayerSafe(nextState);

  // Three doubles → jail
  if (doublesCount >= 3) {
    nextState = goToJail(nextState);
    return {
      ...nextState,
      doublesCount: 0,
    };
  }

  // Jail handling
  if (player.inJail) {
    if (isDouble) {
      nextState = {
        ...nextState,
        players: nextState.players.map((p) =>
          p.id === player.id ? { ...p, inJail: false, jailTurns: 0 } : p
        ),
        events: [
          ...nextState.events,
          { type: "JAIL_EXITED", reason: "DOUBLES" },
        ],
      };
      nextState = movePlayer(nextState, dice);
    } else {
      const turns = player.jailTurns + 1;

      nextState = {
        ...nextState,
        players: nextState.players.map((p) =>
          p.id === player.id ? { ...p, jailTurns: turns } : p
        ),
        events: [
          ...nextState.events,
          { type: "JAIL_TURN_FAILED", attempt: turns },
        ],
      };

      if (turns >= 3) {
        nextState = {
          ...nextState,
          players: nextState.players.map((p) =>
            p.id === player.id ? { ...p, inJail: false, jailTurns: 0 } : p
          ),
          events: [
            ...nextState.events,
            { type: "JAIL_EXITED", reason: "MAX_TURNS" },
          ],
        };
        nextState = movePlayer(nextState, dice);
      }
    }
  } else {
    nextState = movePlayer(nextState, dice);
  }

  // Resolve tile effects
  nextState = resolveCurrentTile(nextState);

  // Do NOT auto-advance turn here.
  // Leave turn index unchanged; frontend will call END_TURN explicitly.
  // Maintain doublesCount so rules can allow extra rolls for doubles.
  return checkGameOver({ ...nextState, doublesCount }); //TODO: check once
}
