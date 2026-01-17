import React, { useState, useEffect, useCallback, useRef } from "react";
import Board from "./Board";
import { tiles, corners } from "./tiles";
import { useGame } from "../context/GameContext";
import { wsClient } from "../services/wsClient";

const TILES_ON_BOARD =
  tiles.bottom.length +
  tiles.left.length +
  tiles.top.length +
  tiles.right.length +
  4; // four corners

// Helper function to get tile by index (matches Board.jsx tile ordering)
const getTileAtIndex = (index) => {
  const allTiles = [
    corners["top-left"],
    ...tiles.bottom,
    corners["top-right"],
    ...tiles.right,
    corners["bottom-right"],
    ...tiles.top,
    corners["bottom-left"],
    ...tiles.left,
  ];
  return allTiles[index];
};

const PLAYER_COLORS = [
  { name: "Red", color: "bg-red-500", borderColor: "border-red-600" },
  { name: "Blue", color: "bg-blue-500", borderColor: "border-blue-600" },
  { name: "Green", color: "bg-green-500", borderColor: "border-green-600" },
  { name: "Yellow", color: "bg-yellow-500", borderColor: "border-yellow-600" },
];

// Tile types that can be purchased
const PURCHASABLE_TYPES = ["property", "railroad", "utility"];

const Game = () => {
  const {
    currentGame,
    currentPlayerId,
    currentRoom,
    rollDice: contextRollDice,
    buyProperty: contextBuyProperty,
    endTurn: contextEndTurn,
    syncGameFromSocket,
  } = useGame();

  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState("idle");

  // Single source of truth for dice values from game state
  const [currentDice, setCurrentDice] = useState({ d1: 1, d2: 1 });
  const [hasRolled, setHasRolled] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [prevPositions, setPrevPositions] = useState({});

  // UI States
  const [_showPropertyCard, setShowPropertyCard] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [_gameLog, setGameLog] = useState([]);
  const lastEventCountRef = useRef(0);
  const logIdCounterRef = useRef(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Get all property tiles for carousel
  const allPropertyTiles = [
    ...tiles.bottom.filter(
      (t) =>
        t.type === "property" || t.type === "railroad" || t.type === "utility"
    ),
    ...tiles.right.filter(
      (t) =>
        t.type === "property" || t.type === "railroad" || t.type === "utility"
    ),
    ...tiles.top.filter(
      (t) =>
        t.type === "property" || t.type === "railroad" || t.type === "utility"
    ),
    ...tiles.left.filter(
      (t) =>
        t.type === "property" || t.type === "railroad" || t.type === "utility"
    ),
  ];

  // Auto-rotate carousel when no tile is clicked
  useEffect(() => {
    if (!_showPropertyCard) {
      const interval = setInterval(() => {
        setCarouselIndex((prev) => {
          const next = (prev + 1) % allPropertyTiles.length;
          // Enable transition for normal slides, disable for wrap-around
          if (next === 0) {
            setIsTransitioning(false);
            setTimeout(() => setIsTransitioning(true), 50);
          }
          return next;
        });
      }, 3000); // Change every 3 seconds
      return () => clearInterval(interval);
    }
  }, [_showPropertyCard, allPropertyTiles.length]);

  // Auto-hide tile details after 5 seconds
  useEffect(() => {
    if (_showPropertyCard) {
      const timeout = setTimeout(() => {
        setShowPropertyCard(null);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timeout);
    }
  }, [_showPropertyCard]);

  const botTimerRef = useRef(null);
  const socketRef = useRef(null);
  const prevGameRef = useRef(null);
  const lastPositionsSigRef = useRef("");

  // Helper Functions
  const addLog = (message) => {
    logIdCounterRef.current += 1;
    setGameLog((prev) => [
      {
        id: `log-${Date.now()}-${logIdCounterRef.current}`,
        message,
        time: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 19), // Keep last 20 logs
    ]);
  };

  const formatEventMessage = (event, game) => {
    const players = game?.players || [];
    const current = players[game?.currentTurnIndex || 0];

    switch (event.type) {
      case "DICE_ROLLED": {
        const name = current?.name || "Player";
        const d1 = event.dice?.die1 ?? "?";
        const d2 = event.dice?.die2 ?? "?";
        const total = d1 + d2;
        const isDoubles = d1 === d2;
        return `🎲 ${name} rolled ${d1} + ${d2} = ${total}${
          isDoubles ? " (Doubles!)" : ""
        }`;
      }

      case "PLAYER_MOVED": {
        const name = current?.name || "Player";
        const tile = getTileAtPosition(event.to);
        const tileName = tile?.title || `Position ${event.to}`;
        return `🚶 ${name} moved to ${tileName}`;
      }

      case "PROPERTY_BOUGHT": {
        const name = current?.name || "Player";
        const tile = getTileAtPosition(current?.position);
        const propertyName = tile?.title || event.tile || "a property";
        const price = tile?.price || "?";
        return `🏠 ${name} bought ${propertyName} for $${price}`;
      }

      case "RENT_PAID": {
        const payer = players.find((p) => p.id === event.from);
        const receiver = players.find((p) => p.id === event.to);
        const amount = event.amount || 0;
        return `💸 ${payer?.name || "Player"} paid $${amount} rent to ${
          receiver?.name || "Player"
        }`;
      }

      case "TURN_ENDED": {
        const next = players.find((p) => p.id === event.nextPlayerId);
        return `⏭️ ${next?.name || "Next player"}'s turn`;
      }

      case "PASSED_GO": {
        const name = current?.name || "Player";
        const amount = event.amount || 200;
        return `✨ ${name} passed GO and collected $${amount}`;
      }

      case "PLAYER_SENT_TO_JAIL": {
        const player = players.find((p) => p.id === event.playerId);
        return `🚔 ${player?.name || "Player"} was sent to jail!`;
      }

      case "JAIL_EXITED": {
        const name = current?.name || "Player";
        const reason =
          event.reason === "DOUBLES"
            ? "by rolling doubles"
            : "after serving time";
        return `🔓 ${name} got out of jail ${reason}`;
      }

      case "JAIL_TURN_FAILED": {
        const name = current?.name || "Player";
        const attempt = event.attempt || 0;
        return `🔒 ${name} failed to roll doubles (Attempt ${attempt}/3)`;
      }

      case "TAX_PAID": {
        const player = players.find((p) => p.id === event.playerId);
        const amount = event.amount || 0;
        return `💰 ${player?.name || "Player"} paid $${amount} in taxes`;
      }

      case "FREE_PARKING_COLLECTED": {
        const player = players.find((p) => p.id === event.playerId);
        const amount = event.amount || 0;
        return `🅿️ ${
          player?.name || "Player"
        } collected $${amount} from Free Parking!`;
      }

      case "PLAYER_BANKRUPT": {
        const player = players.find((p) => p.id === event.playerId);
        const causedBy = event.causedBy
          ? players.find((p) => p.id === event.causedBy)
          : null;
        if (causedBy) {
          return `💔 ${player?.name || "Player"} went bankrupt to ${
            causedBy.name
          }`;
        }
        return `💔 ${player?.name || "Player"} went bankrupt`;
      }

      case "GAME_OVER": {
        const winner = players.find((p) => p.id === event.winnerId);
        return `🏆 Game Over! ${winner?.name || "Player"} wins!`;
      }

      default:
        return `📋 ${
          event.type?.replace(/_/g, " ").toLowerCase() || "Game event"
        }`;
    }
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!currentGame || !currentPlayerId) return;

    const setupWebSocket = async () => {
      try {
        const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:4000";

        const me = currentGame.players.find((p) => p.id === currentPlayerId);
        const playerName =
          me?.name || `Player ${currentPlayerId?.split("-").pop()}`;

        // Connect to WebSocket
        await wsClient.connect(
          wsUrl,
          currentGame.id,
          currentPlayerId,
          playerName
        );

        // Listen for game state updates
        wsClient.on("gameStateUpdate", (newState) => {
          console.log("📨 Game state update received:", newState);
          console.log("📦 Properties in received state:", newState.properties);
          console.log("Current turn index:", newState.currentTurnIndex);
          console.log(
            "Current player:",
            newState.players?.[newState.currentTurnIndex]?.name
          );
          syncGameFromSocket(newState);

          // Log any new events that arrived with this update
          if (Array.isArray(newState.events)) {
            const prevCount = lastEventCountRef.current;
            const total = newState.events.length;
            if (total < prevCount) {
              lastEventCountRef.current = total;
            } else if (total > prevCount) {
              const fresh = newState.events.slice(prevCount);
              // Filter out dice rolls, player moved, and turn ended - only log important events
              const importantEvents = fresh.filter(
                (evt) =>
                  evt.type !== "DICE_ROLLED" &&
                  evt.type !== "PLAYER_MOVED" &&
                  evt.type !== "TURN_ENDED"
              );

              if (importantEvents.length > 0) {
                const newLogs = importantEvents.map((evt, idx) => {
                  const eventIndex = prevCount + idx;
                  const message = formatEventMessage(evt, newState);
                  logIdCounterRef.current += 1;
                  return {
                    id: `log-${eventIndex}-${evt.timestamp || Date.now()}-${
                      logIdCounterRef.current
                    }`,
                    message,
                    time: new Date().toLocaleTimeString(),
                  };
                });

                // Batch update all logs at once
                setGameLog((prev) => [...newLogs, ...prev].slice(0, 20));
              }

              lastEventCountRef.current = total;
            }
          }
        });

        // Listen for errors
        wsClient.on("error", (error) => {
          console.error("❌ WebSocket error:", error);
          showNotification("Connection error: " + error.message, "error");
        });

        // Listen for disconnect
        wsClient.on("disconnect", () => {
          //console.log("👋 WebSocket disconnected");
          showNotification("Disconnected from server", "error");
        });

        showNotification("Connected to game server ✅", "success");
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
        showNotification(
          "Failed to connect to server: " + error.message,
          "error"
        );
      }
    };

    setupWebSocket();

    return () => {
      wsClient.disconnect();
    };
  }, [currentGame?.id, currentPlayerId, syncGameFromSocket]);

  // Reset hasRolled when turn changes
  useEffect(() => {
    const currentTurnIndex = currentGame?.currentTurnIndex;
    if (currentTurnIndex !== undefined) {
      setHasRolled(false);
    }
  }, [currentGame?.currentTurnIndex]);

  // Stream events into the local game log whenever the events array grows
  useEffect(() => {
    if (!currentGame?.events) return;

    const prevCount = lastEventCountRef.current;
    const total = currentGame.events.length;

    if (total < prevCount) {
      lastEventCountRef.current = total;
      return;
    }

    if (total > prevCount) {
      const fresh = currentGame.events.slice(prevCount);
      // Filter out dice rolls, player moved, and turn ended - only log important events
      const importantEvents = fresh.filter(
        (evt) =>
          evt.type !== "DICE_ROLLED" &&
          evt.type !== "PLAYER_MOVED" &&
          evt.type !== "TURN_ENDED"
      );

      if (importantEvents.length > 0) {
        const newLogs = importantEvents.map((evt, idx) => {
          const eventIndex = prevCount + idx;
          const message = formatEventMessage(evt, currentGame);
          logIdCounterRef.current += 1;
          return {
            id: `log-${eventIndex}-${evt.timestamp || Date.now()}-${
              logIdCounterRef.current
            }`,
            message,
            time: new Date().toLocaleTimeString(),
          };
        });

        // Batch update all logs at once
        setGameLog((prev) => [...newLogs, ...prev].slice(0, 20));
      }

      lastEventCountRef.current = total;
    }
  }, [currentGame?.events, currentGame]);

  // Roll Dice + Start Animation
  // Roll Dice - CAPTURE POSITION BEFORE ROLLING
  const rollDice = useCallback(async () => {
    if (isAnimating || hasRolled || isLoadingAction || !currentGame) return;

    try {
      setIsLoadingAction(true);

      // CRITICAL: Capture all player positions BEFORE the roll
      const positionsBeforeRoll = {};
      currentGame.players.forEach((p) => {
        positionsBeforeRoll[p.id] = p.position;
      });

      //console.log("Positions BEFORE roll:", positionsBeforeRoll);
      setPrevPositions(positionsBeforeRoll);

      // Now roll the dice (this will update positions on backend)
      const diceRoll = await contextRollDice();

      // //console.log(
      //   "Rolled:",
      //   diceRoll.d1,
      //   "+",
      //   diceRoll.d2,
      //   "=",
      //   diceRoll.d1 + diceRoll.d2
      // );
      // ... rest of your code

      setCurrentDice(diceRoll);
      setAnimationStep("rotating");
      setIsAnimating(true);
      // If doubles, allow another roll; otherwise mark as rolled
      if (
        currentGame.lastDice &&
        currentGame.lastDice.die1 === currentGame.lastDice.die2
      ) {
        setHasRolled(false);
      } else {
        setHasRolled(true);
      }
    } catch (error) {
      showNotification(error.message, "error");
      console.error("Dice roll failed:", error);
    } finally {
      setIsLoadingAction(false);
    }
  }, [isAnimating, hasRolled, isLoadingAction, currentGame, contextRollDice]);

  // End Turn Function
  const endTurn = useCallback(async () => {
    if (isAnimating || isLoadingAction || !currentGame) return;

    try {
      setIsLoadingAction(true);
      await contextEndTurn();
      addLog(
        `${
          currentGame.players[currentGame.currentTurnIndex]?.name
        }'s turn ended.`
      );
      setHasRolled(false);
    } catch (error) {
      showNotification(error.message, "error");
      console.error("End turn failed:", error);
    } finally {
      setIsLoadingAction(false);
    }
  }, [isAnimating, isLoadingAction, currentGame, contextEndTurn]);

  // Helper to get tile at position
  const getTileAtPosition = (position) => {
    const allTiles = [
      { type: "corner", subType: "go" }, // 0: GO
      ...tiles.bottom, // 1-9
      { type: "corner", subType: "jail" }, // 10: Jail
      ...tiles.right, // 11-19
      { type: "corner", subType: "free-parking" }, // 20: Free Parking
      ...tiles.top, // 21-29
      { type: "corner", subType: "go-to-jail" }, // 30: Go to Jail
      ...tiles.left, // 31-39
    ];
    return allTiles[position] || null;
  };

  // Helper function to check if property can be bought
  const canBuyProperty = () => {
    if (!currentGame || !isMyTurn || !hasRolled) return false;

    const player = currentGame.players?.[currentGame.currentTurnIndex];
    if (!player) return false;

    const tileIndex = player.position;
    const tile = getTileAtPosition(tileIndex);

    // Check if tile is a purchasable type
    if (!tile || !PURCHASABLE_TYPES.includes(tile.type)) {
      return false;
    }

    // Check if property is already owned
    const isOwned = currentGame.properties?.some(
      (p) => p.propertyId === tileIndex
    );
    if (isOwned) {
      return false;
    }

    // Check if player has enough money
    if (player.money < tile.price) {
      return false;
    }

    return true;
  };

  // Buy Property Function
  const buyProperty = useCallback(async () => {
    if (!currentGame) return;

    const player = currentGame.players?.[currentGame.currentTurnIndex];
    if (!player) return;

    const tileIndex = player.position;
    const tile = getTileAtPosition(tileIndex);

    // Check if tile is purchasable
    if (!tile || !PURCHASABLE_TYPES.includes(tile.type)) {
      showNotification("This property cannot be purchased!", "error");
      return;
    }

    // Check if property is already owned
    const isOwned = currentGame.properties?.some(
      (p) => p.propertyId === tileIndex
    );
    if (isOwned) {
      showNotification("This property is already owned!", "error");
      return;
    }

    if (player.money < tile.price) {
      showNotification("Not enough money!", "error");
      return;
    }

    try {
      setIsLoadingAction(true);
      await contextBuyProperty(tileIndex);
      addLog(
        `${player.name} bought property "${tile.title}" for $${tile.price}`
      );
      showNotification(`Property purchased for $${tile.price}!`, "success");
    } catch (error) {
      showNotification(error.message, "error");
      console.error("Buy property failed:", error);
    } finally {
      setIsLoadingAction(false);
    }
  }, [currentGame, contextBuyProperty]);

  // Bot auto-play removed to prevent unintended rolls on other players' turns
  // Sync dice animation across all players in room
  useEffect(() => {
    if (!currentGame || !currentGame.lastDice) return;

    // Check if we already displayed this dice roll
    if (
      currentDice.d1 === currentGame.lastDice.die1 &&
      currentDice.d2 === currentGame.lastDice.die2
    ) {
      return; // Already displayed
    }

    // New dice roll detected - show it for all players
    setCurrentDice({
      d1: currentGame.lastDice.die1,
      d2: currentGame.lastDice.die2,
    });
    setAnimationStep("rotating");
    setIsAnimating(true);
  }, [currentGame?.lastDice]);

  // Sync player position changes from backend -> drive animation with previous positions
  useEffect(() => {
    if (!currentGame?.players) return;

    const nextSig = currentGame.players.map((p) => p.position).join("-");
    const prevSig = lastPositionsSigRef.current;

    if (!prevGameRef.current) {
      prevGameRef.current = currentGame;
      lastPositionsSigRef.current = nextSig;
      return;
    }

    // Detect any movement from the previous game snapshot
    const movedPlayers = currentGame.players.filter((p) => {
      const prevPlayer = prevGameRef.current.players?.find(
        (pp) => pp.id === p.id
      );
      return prevPlayer && prevPlayer.position !== p.position;
    });

    if (nextSig !== prevSig && movedPlayers.length > 0) {
      // Capture previous positions for all players to drive animation start
      const prevPositionsMap = {};
      currentGame.players.forEach((p) => {
        const prevPlayer = prevGameRef.current.players?.find(
          (pp) => pp.id === p.id
        );
        prevPositionsMap[p.id] = prevPlayer ? prevPlayer.position : p.position;
      });

      setPrevPositions(prevPositionsMap);

      // Use latest dice from game if present
      if (currentGame.lastDice) {
        setCurrentDice({
          d1: currentGame.lastDice.die1,
          d2: currentGame.lastDice.die2,
        });
      }

      setAnimationStep("rotating");
      setIsAnimating(true);
      setHasRolled(true);
    }

    prevGameRef.current = currentGame;
    lastPositionsSigRef.current = nextSig;
  }, [currentGame]);
  // Handle Animation Steps
  useEffect(() => {
    if (!isAnimating || !currentGame) return;
    let timeout;
    const diceSum = currentDice.d1 + currentDice.d2;

    //console.log("Animation step:", animationStep, "Dice sum:", diceSum);

    // 1. Dice Rotate Stage
    if (animationStep === "rotating") {
      const rotationDuration = 1000;
      timeout = setTimeout(() => setAnimationStep("waving"), rotationDuration);
    }

    // 2. Token "waving" animation (shake) before moving
    else if (animationStep === "waving") {
      const waveDuration = diceSum * 100 + 500;

      timeout = setTimeout(() => {
        // Movement is handled by backend via rollDice
        // Just update animation
        setAnimationStep("zooming");
      }, waveDuration);
    }

    // 3. Camera zoom animation
    else if (animationStep === "zooming") {
      const zoomDuration = 1200;
      timeout = setTimeout(() => {
        setIsAnimating(false);
        setAnimationStep("idle");
      }, zoomDuration);
    }

    return () => clearTimeout(timeout);
  }, [animationStep, currentDice, isAnimating, currentGame, currentPlayerId]);

  // Determine current player and turn state
  const currentPlayer = currentGame?.players?.[currentGame?.currentTurnIndex];
  const isMyTurn = currentPlayer?.id === currentPlayerId;

  console.log("🎮 Turn Info:", {
    currentTurnIndex: currentGame?.currentTurnIndex,
    currentPlayerName: currentPlayer?.name,
    currentPlayerId: currentPlayer?.id,
    myPlayerId: currentPlayerId,
    isMyTurn,
  });

  console.log(currentDice);
  // Loading state or not in game
  if (!currentGame) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-4">
            Loading game...
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Main Game UI
  return (
    <div className="w-screen h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0f172a] via-[#0b1221] to-[#05070d] text-gray-100">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl border border-white/10 backdrop-blur-md bg-white/10 text-white font-semibold ${
            notification.type === "success"
              ? "shadow-green-500/30"
              : notification.type === "error"
              ? "shadow-red-500/30"
              : "shadow-blue-500/30"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="w-full h-full flex gap-5">
        {/* Left Sidebar - Players */}
        <div className="w-64 bg-white/5 border border-white/10 rounded-2xl shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)] p-5 overflow-y-auto flex flex-col gap-4 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-wide text-gray-100">
              Players
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300 border border-white/10">
              {currentGame.players.length} joined
            </span>
          </div>

          {currentGame.players.map((p, index) => {
            const isCurrentTurn = index === currentGame.currentTurnIndex;
            const isYou = p.id === currentPlayerId;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border transition-all duration-300 bg-gradient-to-br ${
                  isCurrentTurn
                    ? "from-yellow-500/20 via-amber-400/10 to-amber-300/5 border-amber-300/60 shadow-[0_8px_30px_-12px_rgba(251,191,36,0.7)] scale-[1.01]"
                    : "from-white/5 via-white/2 to-white/0 border-white/10 hover:border-white/20"
                }`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between">
                  {/* Left: Name + status */}
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold text-gray-100 text-sm">
                      {p.name}
                      {isYou && <span className="text-amber-300"> (You)</span>}
                    </span>
                    <span
                      className={`text-xs ${
                        isCurrentTurn ? "text-amber-300" : "text-gray-400"
                      }`}
                    >
                      {isCurrentTurn ? "On turn" : "Waiting"}
                    </span>
                  </div>

                  {/* Right: Balance */}
                  <div className="flex flex-col items-end rounded-lg bg-white/5 px-3 py-2 border border-white/10">
                    <span className="text-[11px] text-gray-400">Balance</span>
                    <span className="font-semibold text-sm text-emerald-300">
                      ${p.money.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Game Log */}
          <div className="mt-2 pt-3 border-t border-white/10 relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-200">Game Log</h3>
              <span className="text-[10px] text-gray-400">live</span>
            </div>
            <div className="space-y-1.5 max-h-44 overflow-hidden text-xs pr-1 relative">
              {_gameLog.map((log) => (
                <div
                  key={log.id}
                  className="text-gray-300 bg-white/5 border border-white/5 rounded-md px-2 py-1"
                >
                  <span className="text-gray-400 mr-1">{log.time}</span>
                  {log.message}
                </div>
              ))}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0b1221] via-[#0b1221]/80 to-transparent" />
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 overflow-hidden ">
          <Board
            isAnimating={isAnimating}
            animationStep={animationStep}
            players={currentGame.players}
            currentTurnIndex={currentGame.currentTurnIndex}
            currentDice={currentDice}
            isMyTurn={isMyTurn}
            hasRolled={hasRolled}
            onRollDice={rollDice}
            onEndTurn={endTurn}
            onRollComplete={() => {
              if (animationStep === "rotating") {
                setAnimationStep("waving");
              }
            }}
            onTileClick={({ tile, index }) =>
              setShowPropertyCard({ tile, index })
            }
            prevPositions={prevPositions}
            currentGame={currentGame}
          />

          {/* Dice + Controls Panel - Now inside Board center component */}
        </div>

        {/* Right Sidebar - Actions & Info */}
        <div className="w-80 bg-white/5 border border-white/10 rounded-2xl shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)] p-5 flex flex-col gap-4 backdrop-blur-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-semibold text-lg text-gray-100">Game Panel</h3>
            <span className="text-[11px] text-gray-400">Tools & Info</span>
          </div>

          {/* Action Buttons - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={buyProperty}
              disabled={!canBuyProperty() || isLoadingAction}
              className={`py-3 rounded-xl font-semibold transition-all border text-sm ${
                canBuyProperty() && !isLoadingAction
                  ? "bg-emerald-500/80 border-emerald-400/70 text-white shadow-[0_10px_30px_-15px_rgba(16,185,129,0.8)] hover:-translate-y-0.5"
                  : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              🏠 Buy
            </button>

            <button
              disabled={!isMyTurn}
              className={`py-3 rounded-xl font-semibold transition-all border text-sm ${
                isMyTurn
                  ? "bg-orange-500/80 border-orange-400/70 text-white shadow-[0_10px_30px_-15px_rgba(249,115,22,0.8)] hover:-translate-y-0.5"
                  : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              🏗️ Build
            </button>

            <button
              onClick={() => setShowTradeModal(true)}
              disabled={!isMyTurn}
              className={`py-3 rounded-xl font-semibold transition-all border text-sm ${
                isMyTurn
                  ? "bg-indigo-500/80 border-indigo-400/70 text-white shadow-[0_10px_30px_-15px_rgba(99,102,241,0.8)] hover:-translate-y-0.5"
                  : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              🤝 Trade
            </button>

            <button
              disabled={!isMyTurn}
              className={`py-3 rounded-xl font-semibold transition-all border text-sm ${
                isMyTurn
                  ? "bg-amber-500/80 border-amber-400/70 text-white shadow-[0_10px_30px_-15px_rgba(251,191,36,0.8)] hover:-translate-y-0.5"
                  : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              💰 Mortgage
            </button>
          </div>

          {/* Player Portfolio */}
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-100">Your Properties</h4>
              <span className="text-xs text-gray-400">Portfolio</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/30">
              {(() => {
                // Get all properties owned by current player from backend
                const myProperties =
                  currentGame?.properties?.filter(
                    (prop) =>
                      prop.ownerId === currentPlayerId ||
                      prop.owner === currentPlayerId ||
                      prop.playerId === currentPlayerId
                  ) || [];

                if (myProperties.length > 0) {
                  return myProperties.map((prop) => {
                    const tileIndex =
                      prop.tileIndex ?? prop.propertyId ?? prop.tile;
                    const tile = getTileAtIndex(tileIndex);
                    const tileName = tile?.title || `Tile #${tileIndex}`;

                    return (
                      <div
                        key={`${prop.tileIndex}-${prop.ownerId}`}
                        className="bg-indigo-500/10 border border-indigo-400/30 text-indigo-100 p-2 rounded-lg text-sm"
                      >
                        <span className="font-semibold">{tileName}</span>
                      </div>
                    );
                  });
                } else {
                  return (
                    <p className="text-gray-500 text-sm italic">
                      No properties yet
                    </p>
                  );
                }
              })()}
            </div>
          </div>

          {/* Tile Details / Creative Space */}
          <div className="border-t border-white/10 pt-3 flex-1 flex flex-col">
            {_showPropertyCard ? (
              // Show tile details
              <div>
                <h4 className="font-semibold text-gray-100 mb-3">
                  {_showPropertyCard.tile.title}
                </h4>
                <div className="space-y-2 text-sm">
                  {_showPropertyCard.tile.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price</span>
                      <span className="text-white font-semibold">
                        ${_showPropertyCard.tile.price}
                      </span>
                    </div>
                  )}
                  {_showPropertyCard.tile.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mortgage</span>
                      <span className="text-white font-semibold">
                        ${Math.floor(_showPropertyCard.tile.price / 2)}
                      </span>
                    </div>
                  )}
                  {_showPropertyCard.tile.houseCost && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">House Cost</span>
                      <span className="text-white font-semibold">
                        ${_showPropertyCard.tile.houseCost}
                      </span>
                    </div>
                  )}
                  {Array.isArray(_showPropertyCard.tile.rent) && (
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-gray-300 font-semibold mb-2">
                        Rent Schedule
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Base</span>
                          <span className="text-white">
                            ${_showPropertyCard.tile.rent[0]}
                          </span>
                        </div>
                        {_showPropertyCard.tile.rent.slice(1).map((r, i) => (
                          <div
                            key={`rent-${i}`}
                            className="flex justify-between"
                          >
                            <span className="text-gray-400">
                              {i < _showPropertyCard.tile.rent.length - 2
                                ? `${i + 1} House${i === 0 ? "" : "s"}`
                                : "Hotel"}
                            </span>
                            <span className="text-white">${r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Creative placeholder
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <div className="text-5xl mb-3">🎲</div>
                <h4 className="font-semibold text-gray-200 mb-2">
                  Click a Tile
                </h4>
                <p className="text-gray-400 text-sm">
                  Select any property on the board to view its details and rent
                  information
                </p>
                <div className="mt-6 pt-6 border-t border-white/10 w-full">
                  <p className="text-xs text-gray-500">
                    💡 Tip: Gather properties of the same color to build houses!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Image Display Section */}
          <div className="border-t border-white/10 pt-3">
            {_showPropertyCard ? (
              // Show clicked tile's image
              <div className="relative h-48 rounded-xl overflow-hidden group">
                <img
                  src={_showPropertyCard.tile.image}
                  alt={_showPropertyCard.tile.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                  <div>
                    <h5 className="text-white font-bold text-lg drop-shadow-lg">
                      {_showPropertyCard.tile.title}
                    </h5>
                    <p className="text-white/80 text-xs">
                      {_showPropertyCard.tile.type?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Slideshow carousel
              <div className="relative h-48 rounded-xl overflow-hidden">
                <div
                  className={`flex h-full w-full ${
                    isTransitioning
                      ? "transition-transform duration-700 ease-in-out"
                      : ""
                  }`}
                  style={{
                    transform: `translateX(-${carouselIndex * 100}%)`,
                  }}
                >
                  {allPropertyTiles.map((tile, idx) => (
                    <div
                      key={idx}
                      className="w-full h-full relative flex-shrink-0"
                    >
                      <img
                        src={tile.image}
                        alt={tile.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-4">
                        <div className="w-full">
                          <h5 className="text-white font-bold text-lg drop-shadow-lg mb-1">
                            {tile.title}
                          </h5>
                          <p className="text-white/80 text-xs">
                            {tile.type?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Carousel indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                  {allPropertyTiles.slice(0, 10).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === carouselIndex % 10
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Trade with Players</h2>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Your Offer */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2">Your Offer</h3>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Money amount"
                      className="w-full p-2 border rounded"
                    />
                    <div className="text-sm text-gray-600">
                      Select properties to trade
                    </div>
                  </div>
                </div>

                {/* Their Offer */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2">Request</h3>
                  <select className="w-full p-2 border rounded mb-2">
                    <option>Select player...</option>
                    {currentGame.players
                      .filter((p) => p.id !== currentPlayer?.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="px-6 py-2 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600">
                  Propose Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
