import { bankruptPlayer } from "../engine/bankruptPlayer";
import { GameState, PlayerId, PendingAction } from "../types/game";
import { getGame, updateGame } from "./gameStore";
import { ServerMessage } from "./message";

export type BroadcastFn = (message: ServerMessage) => void;

type PendingActionInfo = {
  playerId: PlayerId;
  key: string;
};

type TrackingEntry = {
  info: PendingActionInfo;
  warningTimer?: NodeJS.Timeout;
  votingStartTimer?: NodeJS.Timeout;
  lastActivityAt: number;
  votes: Set<PlayerId>;
  warningStartedAt?: number;
};

type VoteResult = { ok: true } | { ok: false; error: string };

type InactivityManager = {
  syncFromGameState: (gameId: string, state: GameState) => void;
  recordPlayerActivity: (gameId: string, playerId: PlayerId) => void;
  recordVoteKick: (
    gameId: string,
    voterId: PlayerId,
    targetPlayerId: PlayerId,
  ) => VoteResult;
};

// Timing: 90s warning -> 30s countdown -> 120s voting starts
const WARNING_DELAY_MS = process.env.NODE_ENV === 'development' ? 10 * 1000 : 90 * 1000; // 10s for testing, 90s for production
const KICK_DELAY_MS = process.env.NODE_ENV === 'development' ? 20 * 1000 : 120 * 1000; // 20s for testing, 120s for production

function getPendingActionInfo(state: GameState): PendingActionInfo | null {
  // Case 1: Pending action (BUY_PROPERTY, AUCTION)
  const action: PendingAction = state.pendingAction;
  if (action) {
    const directPlayerId = (action as { playerId?: PlayerId }).playerId;
    const propertyPlayerId =
      action.type === "BUY_PROPERTY" ? action.property?.playerId : undefined;
    const playerId = directPlayerId ?? propertyPlayerId;
    if (!playerId) return null;

    let key: string = action.type;
    if (action.type === "BUY_PROPERTY") {
      const tileIndex = action.property?.tileIndex ?? "unknown";
      key = `BUY_PROPERTY:${tileIndex}`;
    }

    return { playerId, key };
  }

  // Case 2: It's a player's turn but no pending action
  // They should either roll dice or end turn
  if (!state.hasStarted) return null;
  
  const currentPlayer = state.players[state.currentTurnIndex];
  if (!currentPlayer || currentPlayer.isBankrupt) return null;

  // Player is in debt resolution - they must handle that first
  if (currentPlayer.debtResolution) return null;

  // Determine what action the player should take
  const hasRolled = !!state.lastDice;
  const lastDiceEvent = state.events
    .slice()
    .reverse()
    .find((e) => e.type === "DICE_ROLLED");
  
  // Check if the last dice event was from the current player's recent action
  const isCurrentTurn = lastDiceEvent && 
    state.events.slice().reverse().findIndex((e) => e.type === "TURN_ENDED") > 
    state.events.slice().reverse().findIndex((e) => e.type === "DICE_ROLLED");

  let key: string;
  if (!hasRolled || !isCurrentTurn) {
    // Player needs to roll dice
    key = "ROLL_DICE";
  } else {
    // Player has rolled and resolved any pending action, should end turn
    const rolledDoubles = state.lastDice && state.lastDice.die1 === state.lastDice.die2;
    if (rolledDoubles && !currentPlayer.inJail && (state.doublesCount ?? 0) < 3) {
      // Player rolled doubles and can roll again
      key = "ROLL_DICE";
    } else {
      // Player should end turn
      key = "END_TURN";
    }
  }

  return { playerId: currentPlayer.id, key };
}

function clearTimers(entry: TrackingEntry) {
  if (entry.warningTimer) {
    clearTimeout(entry.warningTimer);
  }
  if (entry.votingStartTimer) {
    clearTimeout(entry.votingStartTimer);
  }
}

function getRequiredVotes(state: GameState, targetPlayerId: PlayerId): number {
  return state.players.filter(
    (player) => !player.isBankrupt && player.id !== targetPlayerId,
  ).length;
}

function applyForcedBankruptcy(
  state: GameState,
  targetPlayerId: PlayerId,
): GameState {
  const updated = bankruptPlayer(state, targetPlayerId);
  const pendingInfo = getPendingActionInfo(updated);
  if (pendingInfo?.playerId === targetPlayerId) {
    return { ...updated, pendingAction: null };
  }
  return updated;
}

export function createInactivityManager(
  broadcast: BroadcastFn,
): InactivityManager {
  const tracking = new Map<string, TrackingEntry>();

  const scheduleTimers = (gameId: string, entry: TrackingEntry) => {
    const { info } = entry;
    
    // At 90 seconds: show warning to inactive player (30s countdown)
    entry.warningTimer = setTimeout(() => {
      const game = getGame(gameId);
      if (!game) return;

      const currentInfo = getPendingActionInfo(game.state);
      if (!currentInfo || currentInfo.playerId !== info.playerId) return;

      entry.warningStartedAt = Date.now();

      console.log(
        `⚠️  Inactivity warning sent to ${info.playerId} in game ${gameId}`,
      );

      broadcast({
        type: "INACTIVITY_WARNING",
        gameId,
        playerId: info.playerId,
        secondsRemaining: 30,
      });
    }, WARNING_DELAY_MS);

    // At 120 seconds: voting phase begins for other players
    entry.votingStartTimer = setTimeout(() => {
      const game = getGame(gameId);
      if (!game) return;

      const currentInfo = getPendingActionInfo(game.state);
      if (!currentInfo || currentInfo.playerId !== info.playerId) return;

      const requiredVotes = getRequiredVotes(game.state, info.playerId);

      console.log(
        `🔨 Vote kick available for ${info.playerId} in game ${gameId}. Required votes: ${requiredVotes}`,
      );

      broadcast({
        type: "VOTE_KICK_AVAILABLE",
        gameId,
        targetPlayerId: info.playerId,
        targetPlayerName:
          game.state.players.find((p) => p.id === info.playerId)?.name ||
          "Unknown",
        requiredVotes,
      });
    }, KICK_DELAY_MS);
  };

  const syncFromGameState = (gameId: string, state: GameState) => {
    const info = getPendingActionInfo(state);
    const existing = tracking.get(gameId);

    if (!info) {
      if (existing) {
        clearTimers(existing);
        tracking.delete(gameId);
      }
      return;
    }

    if (!existing ||
      existing.info.playerId !== info.playerId ||
      existing.info.key !== info.key) {
      if (existing) {
        clearTimers(existing);
      }

      const entry: TrackingEntry = {
        info,
        lastActivityAt: Date.now(),
        votes: new Set<PlayerId>(),
      };

      tracking.set(gameId, entry);
      scheduleTimers(gameId, entry);
    }
  };

  const recordPlayerActivity = (gameId: string, playerId: PlayerId) => {
    const entry = tracking.get(gameId);
    if (!entry || entry.info.playerId !== playerId) return;

    // Player acted - clear their inactivity tracking entirely
    // This cancels any warnings, voting, and timers
    // syncFromGameState will create new tracking if the player still has actions to take
    console.log(
      `✅ Player ${playerId} acted - clearing inactivity tracking for game ${gameId}`,
    );
    
    // If voting had started, notify players it's been cancelled
    if (entry.warningStartedAt) {
      broadcast({
        type: "INACTIVITY_RESOLVED",
        gameId,
        playerId,
      });
    }
    
    clearTimers(entry);
    tracking.delete(gameId);
  };

  const recordVoteKick = (
    gameId: string,
    voterId: PlayerId,
    targetPlayerId: PlayerId,
  ): VoteResult => {
    const game = getGame(gameId);
    if (!game) {
      return { ok: false, error: "Game not found" };
    }

    const voter = game.state.players.find((p) => p.id === voterId);
    if (!voter) {
      return { ok: false, error: "Player not found" };
    }

    if (voter.isBankrupt) {
      return { ok: false, error: "Bankrupt players cannot vote" };
    }

    const info = getPendingActionInfo(game.state);
    if (!info || info.playerId !== targetPlayerId) {
      return { ok: false, error: "No pending action for that player" };
    }

    if (voterId === targetPlayerId) {
      return { ok: false, error: "Cannot vote to kick yourself" };
    }

    const entry = tracking.get(gameId);
    if (!entry || entry.info.playerId !== targetPlayerId) {
      return { ok: false, error: "Vote kick not active" };
    }

    entry.votes.add(voterId);

    const requiredVotes = getRequiredVotes(game.state, targetPlayerId);
    broadcast({
      type: "VOTE_KICK_STATUS",
      gameId,
      targetPlayerId,
      voterIds: Array.from(entry.votes),
      requiredVotes,
    });

    if (entry.votes.size >= requiredVotes && requiredVotes > 0) {
      const newState = applyForcedBankruptcy(game.state, targetPlayerId);
      updateGame(gameId, newState);

      broadcast({
        type: "GAME_STATE_UPDATE",
        gameId,
        state: newState,
      });
      broadcast({
        type: "PLAYER_KICKED",
        gameId,
        playerId: targetPlayerId,
        reason: "VOTE_KICK",
      });

      clearTimers(entry);
      tracking.delete(gameId);
    }

    return { ok: true };
  };

  return {
    syncFromGameState,
    recordPlayerActivity,
    recordVoteKick,
  };
}
