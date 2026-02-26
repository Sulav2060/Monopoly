import { GameState, PlayerId, VoteoutState } from "../types/game";
import { bankruptPlayer } from "./bankruptPlayer";

const VOTEOUT_TIMER_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

/**
 * Initiate a voteout for a target player
 */
export function initiateVoteout(
  state: GameState,
  targetPlayerId: PlayerId,
): GameState {
  const voteoutState: Exclude<VoteoutState, null> = {
    //what the heck is this types->in it's type we were telling it is union of VoteoutState and null but we know it's not null so we exclude null from the type
    targetPlayerId,
    voters: [],
    voteCount: 0,
    initializedAt: Date.now(),
  };

  return {
    ...state,
    voteout: voteoutState,
    events: [
      ...state.events,
      {
        type: "VOTEOUT_INITIATED",
        targetPlayerId,
      },
    ],
  };
}

/**
 * Cast a vote to kick out a player
 * Returns updated state and whether the player should be removed
 */
export function voteoutPlayer(
  state: GameState,
  votingPlayerId: PlayerId,
  targetPlayerId: PlayerId,
): { state: GameState; shouldRemovePlayer: boolean } {
  if (!state.voteout || state.voteout.targetPlayerId !== targetPlayerId) {
    // No active voteout or voting for different player - initiate new voteout
    const newState = initiateVoteout(state, targetPlayerId);
    return voteoutPlayer(newState, votingPlayerId, targetPlayerId);
  }

  // Check if this player already voted
  if (state.voteout.voters.includes(votingPlayerId)) {
    // Already voted, return unchanged
    return { state, shouldRemovePlayer: false };
  }

  // Add vote
  const newVoters = [...state.voteout.voters, votingPlayerId];
  const newVoteoutState: Exclude<VoteoutState, null> = {
    ...state.voteout,
    voters: newVoters,
    voteCount: newVoters.length,
  };

  // Calculate remaining active players (not bankrupt, not the target player)
  const activePlayers = state.players.filter(
    (p) => !p.isBankrupt && p.id !== targetPlayerId,
  );

  // Check if votes reach total-1 (all other active players voted)
  const voteThreshold = activePlayers.length;
  const shouldRemovePlayer = newVoteoutState.voteCount >= voteThreshold;

  // Create new state with updated voteout info
  let stateWithVote: GameState = state;

  if (!shouldRemovePlayer) {
    // Update voteout state if player is not being removed yet
    stateWithVote = {
      ...state,
      voteout: newVoteoutState,
    };
  } else {
    // Clear voteout state since we're about to remove the player
    stateWithVote = {
      ...state,
      voteout: null,
    };
  }

  // Add vote event
  const stateWithVoteEvent: GameState = {
    ...stateWithVote,
    events: [
      ...stateWithVote.events,
      {
        type: "VOTEOUT_VOTED",
        votedByPlayerId: votingPlayerId,
        targetPlayerId,
        voteCount: newVoteoutState.voteCount,
      },
    ],
  };

  if (shouldRemovePlayer) {
    // Bankrupt the player
    const bankruptState = bankruptPlayer(stateWithVoteEvent, targetPlayerId);

    // Replace the last bankruptcy event with a voteout player removed event
    const updatedEvents = [...bankruptState.events];
    // Find and replace the PLAYER_BANKRUPT event with VOTEOUT_PLAYER_REMOVED
    const bankruptEventIndex = updatedEvents.findIndex(
      (e) => e.type === "PLAYER_BANKRUPT" && e.playerId === targetPlayerId,
    );

    if (bankruptEventIndex !== -1) {
      updatedEvents[bankruptEventIndex] = {
        type: "VOTEOUT_PLAYER_REMOVED",
        targetPlayerId,
        victimPlayerId: targetPlayerId,
      };
    }

    return {
      state: {
        ...bankruptState,
        events: updatedEvents,
      },
      shouldRemovePlayer: true,
    };
  }

  return { state: stateWithVoteEvent, shouldRemovePlayer: false };
}

/**
 * Reset voteout state (called after 2 minutes)
 */
export function resetVoteout(state: GameState): GameState {
  if (!state.voteout) {
    return state;
  }

  const targetPlayerId = state.voteout.targetPlayerId;

  return {
    ...state,
    voteout: null,
    events: [
      ...state.events,
      {
        type: "VOTEOUT_RESET",
        targetPlayerId,
      },
    ],
  };
}

/**
 * Get vote count for current voteout
 */
export function getVoteoutCount(state: GameState): number {
  return state.voteout?.voteCount ?? 0;
}

/**
 * Get the target player of current voteout
 */
export function getVoteoutTarget(state: GameState): PlayerId | undefined {
  return state.voteout?.targetPlayerId;
}
