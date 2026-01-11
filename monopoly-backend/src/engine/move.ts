import { GameState, DiceRoll, GameEvent } from "../types/game";
import { getCurrentPlayerSafe } from "./assertions";

const BOARD_SIZE = 40;
const GO_REWARD = 200;

export function movePlayer(state: GameState, dice: DiceRoll): GameState {
  const player = getCurrentPlayerSafe(state);
  const steps = dice.die1 + dice.die2;

  const from = player.position;
  let to = from + steps;
  let passedGo = false;

  if (to >= BOARD_SIZE) {
    //TODO: passedGo,provide 200 as reward,but not for the jail crossing(i feel jail crossing won't provide that as we aren't using move for it.instead we are using goToJail which simply changes the position)
    to = to % BOARD_SIZE;
    passedGo = true;
  }

  const updatedPlayer = {
    ...player,
    position: to,
    money: passedGo ? player.money + GO_REWARD : player.money,
  };

  const players = [...state.players];
  players[state.currentTurnIndex] = updatedPlayer;

  const events: GameEvent[] = [
    ...state.events,
    // { type: "DICE_ROLLED", dice },
    { type: "PLAYER_MOVED", from, to },
  ];

  if (passedGo) {
    events.push({ type: "PASSED_GO", amount: GO_REWARD });
  }

  return {
    ...state,
    players,
    lastDice: dice,
    events,
  };
}
