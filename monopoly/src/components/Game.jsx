import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Board from "./Board";
import AuctionModal from "./AuctionModal";
import Rules from "./Rules";
import { tiles, corners } from "./tiles";
import { useGame } from "../context/GameContext";
import { wsClient } from "../services/wsClient";
import {
  playDiceRoll,
  playMove,
  playPropertyBought,
  playGoToJail,
  playTurnEnd,
  playMoney,
  playTax,
} from "../services/sound";
import BuildMenu from "./BuildMenu";

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
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeTargetPlayerId, setTradeTargetPlayerId] = useState("");
  const [tradeOfferMoney, setTradeOfferMoney] = useState("");
  const [tradeOfferProperties, setTradeOfferProperties] = useState([]);
  const [tradeRequestMoney, setTradeRequestMoney] = useState("");
  const [tradeRequestProperties, setTradeRequestProperties] = useState([]);
  const [tradeTab, setTradeTab] = useState("new"); // "new" or "incoming"
  const [showMortgageModal, setShowMortgageModal] = useState(false);
  const [mortgageTab, setMortgageTab] = useState("mortgage");
  const [selectedMortgageTiles, setSelectedMortgageTiles] = useState([]);
  const [showRules, setShowRules] = useState(false);
  const [notification, setNotification] = useState(null);
  const [eventCards, setEventCards] = useState([]);
  const [pendingEventCards, setPendingEventCards] = useState([]);
  const [pendingSounds, setPendingSounds] = useState([]);
  const eventCardTimeoutRef = useRef(null);
  const [_gameLog, setGameLog] = useState([]);
  const lastEventCountRef = useRef(0);
  const logIdCounterRef = useRef(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [renderPlayers, setRenderPlayers] = useState([]); // UI-only player positions for staged animations
  const [pendingTeleport, setPendingTeleport] = useState(null); // { playerId, landingPos, finalPos }

  // Get all property tiles for carousel
  const allPropertyTiles = [
    ...tiles.bottom.filter(
      (t) =>
        t.type === "property" || t.type === "railroad" || t.type === "utility",
    ),
    ...tiles.right.filter(
      (t) =>
        t.type === "property" || t.type === "railroad" || t.type === "utility",
    ),
    ...tiles.top.filter(
      (t) =>
        t.type === "property" || t.type === "railroad" || t.type === "utility",
    ),
    ...tiles.left.filter(
      (t) =>
        t.type === "property" || t.type === "railroad" || t.type === "utility",
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

      case "PROPERTY_SKIPPED": {
        const player = players.find((p) => p.id === event.playerId);
        const tile = getTileAtPosition(event.tileIndex);
        const tileName = tile?.title || `Tile ${event.tileIndex}`;
        return `⏭️ ${player?.name || "Player"} skipped buying ${tileName}`;
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
        return `💰 ${player?.name || "Player"} paid Rs. ${amount} in taxes`;
      }

      case "FREE_PARKING_COLLECTED": {
        const player = players.find((p) => p.id === event.playerId);
        const amount = event.amount || 0;
        return `🅿️ ${
          player?.name || "Player"
        } collected $${amount} from Free Parking!`;
      }

      case "COMMUNITY_CHEST": {
        const name = current?.name || "Player";
        const moveEvent = game?.events
          ?.slice()
          .reverse()
          .find(
            (e) => e.type === "PLAYER_MOVED" && e.to !== event.card?.position,
          );
        const tilePos = moveEvent ? moveEvent.to : current?.position;
        const tile = getTileAtPosition(tilePos);
        const label = tile?.type === "chance" ? "Chance" : "Community Chest";
        if (event.card?.type === "MONEY") {
          const amt = event.card.amount ?? 0;
          return `🎁 ${name} received Rs. ${amt} from ${label}`;
        }
        if (event.card?.type === "MOVE") {
          const targetTile = getTileAtPosition(event.card.position);
          const targetName =
            targetTile?.title || `Position ${event.card.position}`;
          return `🎁 ${name} drew ${label} and moved to ${targetName}`;
        }
        if (event.card?.type === "GO_TO_JAIL") {
          return `🎁 ${name} drew ${label}: Go To Jail!`;
        }
        return `🎁 ${name} drew a card`;
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

      case "TRADE_OFFERED": {
        const initiator = players.find(
          (p) => p.id === event.initiatingPlayerId,
        );
        const target = players.find((p) => p.id === event.targetPlayerId);
        return `🤝 ${initiator?.name || "Player"} offered a trade to ${target?.name || "Player"}`;
      }

      case "TRADE_ACCEPTED": {
        const target = players.find((p) => p.id === event.targetPlayerId);
        const initiator = players.find(
          (p) => p.id === event.initiatingPlayerId,
        );
        return `✅ ${target?.name || "Player"} accepted ${initiator?.name || "Player"}'s trade`;
      }

      case "TRADE_REJECTED": {
        const target = players.find((p) => p.id === event.targetPlayerId);
        const initiator = players.find(
          (p) => p.id === event.initiatingPlayerId,
        );
        return `❌ ${target?.name || "Player"} rejected ${initiator?.name || "Player"}'s trade`;
      }

      case "TRADE_CANCELLED": {
        const initiator = players.find(
          (p) => p.id === event.initiatingPlayerId,
        );
        const target = players.find((p) => p.id === event.targetPlayerId);
        return `🚫 ${initiator?.name || "Player"} cancelled trade offer to ${target?.name || "Player"}`;
      }

      case "PROPERTY_BUILT": {
        const player = players.find((p) => p.id === event.playerId);
        const tile = getTileAtPosition(event.tileIndex);
        const propertyName = tile?.title || "a property";
        const houses = event.houses || 0;
        const buildingType =
          houses === 5 ? "hotel" : houses === 1 ? "house" : "houses";
        return `🏗️ ${player?.name || "Player"} built ${houses === 5 ? "a " : ""}${houses === 5 ? "hotel" : houses + " " + buildingType} on ${propertyName}`;
      }

      case "AUCTION_STARTED": {
        const tile = getTileAtPosition(event.property?.tileIndex);
        const propertyName =
          tile?.title || event.property?.title || "a property";
        return `🔨 Auction started for ${propertyName}`;
      }

      case "AUCTION_WON": {
        const winner = players.find((p) => p.id === event.playerId);
        const tile = getTileAtPosition(event.tileIndex);
        const propertyName = tile?.title || "a property";
        const amount = event.amount || 0;
        return `🔨 ${winner?.name || "Player"} won ${propertyName} for $${amount}`;
      }

      case "AUCTION_UNSOLD": {
        const tile = getTileAtPosition(event.tileIndex);
        const propertyName = tile?.title || "a property";
        return `🔨 ${propertyName} remained unsold`;
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

  const getEventCardDetails = (event) => {
    if (!event) return null;
    const players = currentGame?.players || [];
    const current = players[currentGame?.currentTurnIndex || 0];
    const name = current?.name || "Player";

    switch (event.type) {
      case "COMMUNITY_CHEST": {
        // Try to find the previous PLAYER_MOVED event to determine if it was Chance or Community Chest
        const moveEvent = currentGame?.events
          ?.slice()
          .reverse()
          .find(
            (e) => e.type === "PLAYER_MOVED" && e.to !== event.card?.position,
          );
        const tilePos = moveEvent ? moveEvent.to : current?.position;
        const tile = getTileAtPosition(tilePos);
        const label = tile?.type === "chance" ? "Chance" : "Community Chest";
        const icon = tile?.type === "chance" ? "❓" : "🎁";

        if (event.card?.type === "MONEY") {
          return {
            title: label,
            icon,
            message: `You received Rs. ${event.card.amount}`,
            color: "bg-green-500",
          };
        }
        if (event.card?.type === "MOVE") {
          const targetTile = getTileAtPosition(event.card.position);
          const targetName =
            targetTile?.title || `Position ${event.card.position}`;
          return {
            title: label,
            icon,
            message: `Advance to ${targetName}`,
            color: "bg-blue-500",
          };
        }
        if (event.card?.type === "GO_TO_JAIL") {
          return {
            title: label,
            icon,
            message: `Go directly to Jail!`,
            color: "bg-red-500",
          };
        }
        return {
          title: label,
          icon,
          message: `You drew a card`,
          color: "bg-purple-500",
        };
      }
      case "PLAYER_SENT_TO_JAIL": {
        const player = players.find((p) => p.id === event.playerId);
        return {
          title: "Go To Jail!",
          icon: "🚔",
          message: `${player?.name || "Player"} was sent to jail!`,
          color: "bg-red-600",
        };
      }
      case "JAIL_EXITED": {
        const reason =
          event.reason === "DOUBLES"
            ? "by rolling doubles"
            : "after serving time";
        return {
          title: "Out of Jail!",
          icon: "🔓",
          message: `${name} got out of jail ${reason}`,
          color: "bg-green-500",
        };
      }
      case "JAIL_TURN_FAILED": {
        return {
          title: "Still in Jail",
          icon: "🔒",
          message: `${name} failed to roll doubles (Attempt ${event.attempt || 0}/3)`,
          color: "bg-gray-600",
        };
      }
      case "PASSED_GO": {
        return {
          title: "Passed GO",
          icon: "✨",
          message: `Collected $${event.amount || 200}`,
          color: "bg-yellow-500",
        };
      }
      case "FREE_PARKING_COLLECTED": {
        const player = players.find((p) => p.id === event.playerId);
        return {
          title: "Free Parking",
          icon: "🅿️",
          message: `${player?.name || "Player"} collected $${event.amount || 0}!`,
          color: "bg-green-400",
        };
      }
      case "TAX_PAID": {
        const player = players.find((p) => p.id === event.playerId);
        return {
          title: "Tax Paid",
          icon: "💰",
          message: `${player?.name || "Player"} paid Rs. ${event.amount || 0} in taxes`,
          color: "bg-red-400",
        };
      }
      case "PLAYER_BANKRUPT": {
        const player = players.find((p) => p.id === event.playerId);
        const causedBy = event.causedBy
          ? players.find((p) => p.id === event.causedBy)
          : null;
        const message = causedBy
          ? `${player?.name || "Player"} went bankrupt to ${causedBy.name}`
          : `${player?.name || "Player"} went bankrupt`;
        return {
          title: "Bankrupt!",
          icon: "💔",
          message,
          color: "bg-gray-800",
        };
      }
      case "GAME_OVER": {
        const winner = players.find((p) => p.id === event.winnerId);
        return {
          title: "Game Over!",
          icon: "🏆",
          message: `${winner?.name || "Player"} wins!`,
          color: "bg-yellow-400",
        };
      }
      default:
        return null;
    }
  };

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Note: Connection is handled by App.jsx. Game.jsx only listens to events.
    if (!currentGame || !currentPlayerId) return;

    const handleError = (error) => {
      console.error("❌ WebSocket error:", error);
      showNotification("Connection error: " + error.message, "error");
    };

    const handleDisconnect = () => {
      showNotification("Disconnected from server", "error");
    };

    // Register listeners
    wsClient.on("error", handleError);
    wsClient.on("disconnect", handleDisconnect);

    // CLEANUP listeners on unmount or re-run
    return () => {
      wsClient.off("error", handleError);
      wsClient.off("disconnect", handleDisconnect);
    };
  }, [currentGame?.id, currentPlayerId]);

  // Reset hasRolled when turn changes
  useEffect(() => {
    const currentTurnIndex = currentGame?.currentTurnIndex;
    if (currentTurnIndex !== undefined) {
      setHasRolled(false);
    }
  }, [currentGame?.currentTurnIndex]);

  // Keep a render-friendly copy of players unless we are staging a teleport
  useEffect(() => {
    if (pendingTeleport) return;
    if (currentGame?.players) {
      setRenderPlayers(currentGame.players);
    }
  }, [currentGame?.players, pendingTeleport]);

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

      // Play sounds for all new events
      try {
        fresh.forEach((evt) => {
          switch (evt.type) {
            case "DICE_ROLLED":
              playDiceRoll();
              break;
            case "PLAYER_MOVED":
              playMove();
              break;
            case "PROPERTY_BOUGHT":
              playPropertyBought();
              break;
            case "TURN_ENDED":
              playTurnEnd();
              break;
            case "PLAYER_SENT_TO_JAIL":
            case "COMMUNITY_CHEST":
            case "FREE_PARKING_COLLECTED":
            case "TAX_PAID":
            case "RENT_PAID":
              setPendingSounds((prev) => [...prev, evt]);
              break;
            case "PASSED_GO":
              playMoney(evt.amount ?? 0);
              break;
            default:
              break;
          }
        });
      } catch (e) {
        // ignore audio errors
      }

      // Filter out low-signal events; keep ordering as sent by backend
      const importantEvents = fresh.filter(
        (evt) =>
          evt.type !== "DICE_ROLLED" &&
          evt.type !== "PLAYER_MOVED" &&
          evt.type !== "PROPERTY_OFFERED" &&
          evt.type !== "AUCTION_BID_PLACED" &&
          evt.type !== "AUCTION_PLAYER_PASSED",
      );

      // Check for events that should show a card
      let cardEvents = fresh.filter(
        (evt) =>
          evt.type === "COMMUNITY_CHEST" ||
          evt.type === "PLAYER_SENT_TO_JAIL" ||
          evt.type === "PASSED_GO" ||
          evt.type === "FREE_PARKING_COLLECTED" ||
          evt.type === "TAX_PAID" ||
          evt.type === "PLAYER_BANKRUPT" ||
          evt.type === "GAME_OVER" ||
          evt.type === "JAIL_EXITED" ||
          evt.type === "JAIL_TURN_FAILED",
      );

      // If there is a COMMUNITY_CHEST event that sends to jail, filter out the redundant PLAYER_SENT_TO_JAIL card
      const hasCommunityChestJail = cardEvents.some(
        (evt) =>
          evt.type === "COMMUNITY_CHEST" && evt.card?.type === "GO_TO_JAIL",
      );
      if (hasCommunityChestJail) {
        cardEvents = cardEvents.filter(
          (evt) => evt.type !== "PLAYER_SENT_TO_JAIL",
        );
      }

      // If time served frees the player, hide the final failed-attempt card
      const hasTimeServedExit = cardEvents.some(
        (evt) => evt.type === "JAIL_EXITED" && evt.reason !== "DOUBLES",
      );
      if (hasTimeServedExit) {
        cardEvents = cardEvents.filter(
          (evt) =>
            !(evt.type === "JAIL_TURN_FAILED" && Number(evt.attempt) >= 3),
        );
      }

      if (cardEvents.length > 0) {
        // Immediately show PASSED_GO, queue others
        const passedGoEvents = cardEvents.filter((e) => e.type === "PASSED_GO");
        const otherEvents = cardEvents.filter((e) => e.type !== "PASSED_GO");

        if (passedGoEvents.length > 0) {
          setEventCards((prev) => {
            // Filter out any existing PASSED_GO cards to avoid duplicates if multiple events fire
            const filteredPrev = prev.filter((c) => c.type !== "PASSED_GO");
            const newCards = [...filteredPrev, ...passedGoEvents];
            if (eventCardTimeoutRef.current) {
              clearTimeout(eventCardTimeoutRef.current);
            }
            eventCardTimeoutRef.current = setTimeout(
              () => setEventCards([]),
              4000,
            );
            return newCards;
          });
        }

        if (otherEvents.length > 0) {
          setPendingEventCards((prev) => [...prev, ...otherEvents]);
        }
      }

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

  // Process pending event cards and sounds when animation is complete
  useEffect(() => {
    if (animationStep === "idle" || animationStep === "showing_card") {
      if (pendingEventCards.length > 0) {
        setEventCards((prev) => {
          // Filter out any existing PASSED_GO cards to avoid duplicates if multiple events fire
          const filteredPrev = prev.filter((c) => c.type !== "PASSED_GO");
          const newCards = [...filteredPrev, ...pendingEventCards];
          if (eventCardTimeoutRef.current) {
            clearTimeout(eventCardTimeoutRef.current);
          }
          eventCardTimeoutRef.current = setTimeout(
            () => setEventCards([]),
            4000,
          );
          return newCards;
        });
        setPendingEventCards([]);
      }

      if (pendingSounds.length > 0) {
        pendingSounds.forEach((evt) => {
          switch (evt.type) {
            case "PLAYER_SENT_TO_JAIL":
              playGoToJail();
              break;
            case "COMMUNITY_CHEST":
              if (evt.card?.type === "MONEY") {
                playMoney(evt.card.amount ?? 0);
              }
              break;
            case "FREE_PARKING_COLLECTED":
              playMoney(evt.amount ?? 0);
              break;
            case "TAX_PAID":
              playTax(evt.amount ?? 0);
              break;
            case "RENT_PAID":
              playTax(evt.amount ?? 0);
              break;
            default:
              break;
          }
        });
        setPendingSounds([]);
      }
    }
  }, [animationStep, pendingEventCards, pendingSounds]);

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
    if (!currentGame || !isMyTurn) return false;

    // New backend-driven logic: only show buy button when backend sets pendingAction
    const pendingAction = currentGame.pendingAction;

    if (
      !(
        pendingAction?.type === "BUY_PROPERTY" &&
        (pendingAction.playerId === currentPlayerId ||
          pendingAction.property?.playerId === currentPlayerId)
      )
    ) {
      return false;
    }

    // Check if player has enough money
    const player = currentGame.players?.[currentGame.currentTurnIndex];
    if (!player) return false;

    const tileIndex = player.position;
    const tile = getTileAtPosition(tileIndex);
    const price = tile?.price ?? null;

    if (price === null || price === undefined) return false;

    return player.money >= price;
  };

  // Buy Property Function
  const buyProperty = useCallback(async () => {
    if (!currentGame) return;

    try {
      setIsLoadingAction(true);
      await contextBuyProperty();
      showNotification("Property purchased!", "success");
    } catch (error) {
      showNotification(error.message, "error");
      console.error("Buy property failed:", error);
    } finally {
      setIsLoadingAction(false);
    }
  }, [currentGame, contextBuyProperty]);

  const proposeTrade = () => {
    if (!tradeTargetPlayerId) {
      showNotification("Please select a player to trade with", "error");
      return;
    }
    wsClient.send({
      type: "INITIATE_TRADE",
      gameId: currentGame.id,
      playerId: currentPlayerId,
      targetPlayerId: tradeTargetPlayerId,
      offerMoney: Number(tradeOfferMoney) || 0,
      offerProperties: tradeOfferProperties,
      requestMoney: Number(tradeRequestMoney) || 0,
      requestProperties: tradeRequestProperties,
    });
    setShowTradeModal(false);
    setTradeTargetPlayerId("");
    setTradeOfferMoney("");
    setTradeOfferProperties([]);
    setTradeRequestMoney("");
    setTradeRequestProperties([]);
    showNotification("Trade offer sent!", "success");
  };

  const finalizeTrade = (tradeId, action) => {
    wsClient.send({
      type: "FINALIZE_TRADE",
      gameId: currentGame.id,
      tradeId,
      action,
    });
  };

  const mortgageProperty = (tileIndex) => {
    wsClient.send({
      type: "MORTGAGE_PROPERTY",
      gameId: currentGame.id,
      playerId: currentPlayerId,
      tileIndex,
    });
  };

  const unmortgageProperty = (tileIndex) => {
    wsClient.send({
      type: "UNMORTGAGE_PROPERTY",
      gameId: currentGame.id,
      playerId: currentPlayerId,
      tileIndex,
    });
  };

  const deleteTrade = (tradeId) => {
    wsClient.send({
      type: "DELETE_TRADE",
      gameId: currentGame.id,
      playerId: currentPlayerId,
      tradeId,
    });
    showNotification("Trade offer cancelled", "success");
  };

  // Bot auto-play removed to prevent unintended rolls on other players' turns
  // Sync dice animation across all players in room
  useEffect(() => {
    if (!currentGame || !currentGame.lastDice) return;

    // Check if we already displayed this dice roll
    if (
      currentDice &&
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

    const recentEvents = currentGame.events?.slice(-3) || [];

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
        (pp) => pp.id === p.id,
      );
      return prevPlayer && prevPlayer.position !== p.position;
    });

    if (nextSig !== prevSig && movedPlayers.length > 0) {
      // Capture previous positions for all players to drive animation start
      const prevPositionsMap = {};
      currentGame.players.forEach((p) => {
        const prevPlayer = prevGameRef.current.players?.find(
          (pp) => pp.id === p.id,
        );
        prevPositionsMap[p.id] = prevPlayer ? prevPlayer.position : p.position;
      });

      // Default: use real players list for rendering
      let stagedPlayers = currentGame.players;
      let stagedTeleport = null;

      // Detect teleport triggered immediately after landing on Chance/Community Chest/Go To Jail
      for (const moved of movedPlayers) {
        const startPos = prevPositionsMap[moved.id] ?? moved.position;
        const diceSum = currentGame.lastDice
          ? (currentGame.lastDice.die1 || 0) + (currentGame.lastDice.die2 || 0)
          : 0;

        if (!diceSum) break; // cannot stage without dice info

        const landingPos = (startPos + diceSum) % TILES_ON_BOARD;

        if (moved.position !== landingPos) {
          stagedTeleport = {
            playerId: moved.id,
            landingPos,
            finalPos: moved.position,
          };

          stagedPlayers = currentGame.players.map((p) =>
            p.id === moved.id ? { ...p, position: landingPos } : p,
          );

          break; // only stage the first detected teleport per tick
        }
      }

      setPrevPositions(prevPositionsMap);
      setRenderPlayers(stagedPlayers);

      // Use latest dice from game if present
      if (currentGame.lastDice) {
        setCurrentDice({
          d1: currentGame.lastDice.die1,
          d2: currentGame.lastDice.die2,
        });
      }

      setPendingTeleport(stagedTeleport);
      setAnimationStep("rotating");
      setIsAnimating(true);
      // direct setHasRolled(true) here was causing issues with doubles;; once rolled turn ends
      //can find better approach to this...
      const turnPlayer = currentGame.players[currentGame.currentTurnIndex];
      const isMyTurn = turnPlayer && turnPlayer.id === currentPlayerId;

      if (isMyTurn) {
        const d = currentGame.lastDice;
        const isDoubles = d && d.die1 === d.die2;
        const meNow = currentGame.players.find((p) => p.id === currentPlayerId);
        // If it's a double and I'm not in jail (e.g. from 3 doubles), I can roll again
        if (isDoubles && meNow && !meNow.inJail) {
          setHasRolled(false);
        } else {
          setHasRolled(true);
        }
      } else {
        setHasRolled(true);
      }
    }

    prevGameRef.current = currentGame;
    lastPositionsSigRef.current = nextSig;
  }, [currentGame, currentPlayerId]);
  // Handle Animation Steps
  useEffect(() => {
    if (!isAnimating || !currentGame) return;
    let timeout;
    const diceSum = currentDice ? currentDice.d1 + currentDice.d2 : 0;

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
        if (pendingTeleport || pendingEventCards.length > 0) {
          setAnimationStep("showing_card");
        } else {
          setAnimationStep("zooming");
        }
      }, waveDuration);
    }

    // 2.5 Show card before teleporting
    else if (animationStep === "showing_card") {
      const extraHold = 2000;
      timeout = setTimeout(() => {
        if (pendingTeleport) {
          // After showing the landing tile, teleport to jail without wave
          setPrevPositions((prev) => ({
            ...prev,
            [pendingTeleport.playerId]: pendingTeleport.landingPos,
          }));

          setRenderPlayers((prev) =>
            prev.map((p) =>
              p.id === pendingTeleport.playerId
                ? { ...p, position: pendingTeleport.finalPos }
                : p,
            ),
          );

          setPendingTeleport(null);
        }
        setAnimationStep("zooming");
      }, extraHold);
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
  }, [
    animationStep,
    currentDice,
    isAnimating,
    currentGame,
    currentPlayerId,
    pendingTeleport,
    pendingEventCards,
  ]);

  // Determine current player and turn state
  const currentPlayer = currentGame?.players?.[currentGame?.currentTurnIndex];
  const isMyTurn = currentPlayer?.id === currentPlayerId;
  const gameOverEvent = currentGame?.events
    ?.slice()
    .reverse()
    .find((event) => event.type === "GAME_OVER");
  const winnerId =
    gameOverEvent?.winnerId || currentGame?.winnerId || currentGame?.winner?.id;
  const winner = currentGame?.players?.find((p) => p.id === winnerId);
  const otherPlayers = (currentGame?.players || []).filter(
    (p) => p.id !== winnerId,
  );

  // Loading state or not in game
  if (!currentGame) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-linear-to-br from-green-100 to-blue-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-4">
            Loading game...
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (gameOverEvent) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#1f2937_0%,#0b1221_45%,#05070d_100%)] text-gray-100 p-6 overflow-hidden relative">
        {/* Glow Background Effect */}
        <div className="absolute top-[-200px] w-[600px] h-[600px] bg-emerald-500/20 blur-[140px] rounded-full animate-pulse" />

        <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl p-8 sm:p-10 animate-[fadeIn_.6s_ease-out]">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="text-6xl animate-bounce">🏆</div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Game Over
            </h1>

            <p className="text-lg sm:text-xl text-emerald-300 font-semibold">
              {winner?.name || "Winner"} Wins!
            </p>

            <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent mt-2" />
          </div>

          {/* Winner Spotlight */}
          <div className="mt-10 relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-3xl" />

            <div className="relative rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 flex flex-col items-center text-center gap-3 shadow-lg">
              <div className="text-sm uppercase tracking-widest text-emerald-300">
                Champion
              </div>

              <div className="text-2xl font-extrabold text-white">
                {winner?.name || "Winner"}
              </div>

              {winner?.money !== undefined && (
                <div className="text-emerald-300 text-sm font-medium">
                  Rs. {winner.money.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Other Players Ranking */}
          {otherPlayers.length > 0 && (
            <div className="mt-10">
              <div className="text-xs uppercase tracking-widest text-gray-400 mb-4 text-center">
                Final Standings
              </div>

              <div className="space-y-3">
                {otherPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-bold text-gray-400">
                        #{index + 2}
                      </div>
                      <span className="text-sm font-semibold text-gray-100">
                        {player.name}
                      </span>
                    </div>

                    {player.money !== undefined && (
                      <span className="text-xs text-gray-300">
                        Rs. {player.money.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all duration-200 font-semibold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Game UI
  return (
    <div className="w-screen h-screen flex items-center justify-center p-2 lg:p-6 bg-linear-to-br from-[#0f172a] via-[#0b1221] to-[#05070d] text-gray-100 overflow-hidden">
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

      <div className="w-full h-full flex flex-col lg:flex-row gap-2 lg:gap-5 overflow-y-auto lg:overflow-hidden scrollbar-hide">
        {/* Left Sidebar - Players */}
        <div className="w-full lg:w-64 order-1 lg:order-1 shrink-0 bg-white/5 border border-white/10 rounded-2xl shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)] p-4 lg:p-5 flex flex-col gap-4 backdrop-blur-lg">
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
                className={`relative group py-2 px-4 transition-all duration-500 overflow-hidden`}
              >
                {/* Active Turn Glow Indicator */}
                {isCurrentTurn && (
                  <div className="absolute top-0 left-0 w-1 h-full rounded-3xl bg-amber-500 " />
                )}

                <div className="flex items-center justify-between relative z-10">
                  {/* Left: Player Avatar & Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {/* Pulsing ring for current turn */}
                      {isCurrentTurn && (
                        <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-20" />
                      )}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-inner ${PLAYER_COLORS[index]?.color} ${PLAYER_COLORS[index]?.borderColor}`}
                      ></div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-sm tracking-wide text-gray-100}`}
                        >
                          {p.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Balance Display */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span
                        className={`text-sm font-mono font-bold ${isCurrentTurn ? "text-emerald-400" : "text-emerald-500/70"}`}
                      >
                        Rs. {p.money.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mt-2 pt-3 border-t border-white/10 relative flex-1 flex flex-col min-h-0 max-h-[50%]">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="font-semibold text-sm text-gray-200">Game Log</h3>
              <span className="text-[10px] text-gray-400">live</span>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto text-xs pr-1 relative scrollbar-hide">
              {_gameLog.map((log) => (
                <div
                  key={log.id}
                  className="text-gray-300 bg-white/5 border border-white/5 rounded-md px-2 py-1"
                >
                  <span className="text-gray-400 mr-1">{log.time}</span>
                  {log.message}
                </div>
              ))}

              {/* fade at bottom */}
              <div className="pointer-events-none sticky bottom-0 h-8 bg-linear-to-t from-[#181F2E] via-[#181F2E]/80 to-transparent" />
            </div>
          </div>

          {/* Event Card Display (Bottom Left) */}
          {eventCards.length > 0 && (
            <div className="mt-4 shrink-0 relative flex flex-col gap-2">
              {eventCards.map((card, idx) => {
                const details = getEventCardDetails(card);
                if (!details) return null;
                return (
                  <div
                    key={idx}
                    className="relative transform transition-all duration-500 scale-100 opacity-100 bg-white rounded-xl p-4 shadow-lg border-2 border-white/20 text-center overflow-hidden"
                  >
                    {/* Decorative background elements */}
                    <div
                      className={`absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-20 blur-xl ${details.color}`}
                    />
                    <div
                      className={`absolute -bottom-12 -left-12 w-24 h-24 rounded-full opacity-20 blur-xl ${details.color}`}
                    />

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="text-3xl mb-2 animate-bounce">
                        {details.icon}
                      </div>
                      <h3 className="text-lg font-black text-gray-800 mb-1 uppercase tracking-wider">
                        {details.title}
                      </h3>
                      <div className="w-8 h-0.5 bg-gray-200 mx-auto mb-2 rounded-full" />
                      <p className="text-sm text-gray-600 font-medium leading-snug">
                        {details.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="w-full lg:w-auto lg:flex-1 order-2 lg:order-2 shrink-0 lg:min-h-0 lg:aspect-square flex flex-col items-center justify-center gap-4 p-2 h-auto lg:h-auto overflow-hidden">
          <Board
            isAnimating={isAnimating}
            animationStep={animationStep}
            players={
              renderPlayers?.length ? renderPlayers : currentGame.players
            }
            currentTurnIndex={currentGame.currentTurnIndex}
            currentDice={currentDice}
            isMyTurn={isMyTurn}
            hasRolled={hasRolled}
            isPendingAction={
              !!currentGame?.pendingAction &&
              currentGame.pendingAction.type !== "AUCTION" // AUCTION handles itself via modal
            }
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
        <div className="w-full lg:w-72 order-3 lg:order-3 shrink-0 bg-white/5 border border-white/10 rounded-2xl shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)] p-4 lg:p-5 flex flex-col gap-4 backdrop-blur-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-100">
                Game Panel
              </h3>
              <span className="text-[11px] text-gray-400">Tools & Info</span>
            </div>
            <button
              onClick={() => setShowRules(true)}
              className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 transition-all group"
              title="Game Rules"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-500 group-hover:scale-110 transition-transform"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </div>

          {/* Action Buttons - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Show Buy and Skip buttons when there's a pending property purchase */}
            {currentGame?.pendingAction?.type === "BUY_PROPERTY" &&
            (currentGame?.pendingAction?.playerId === currentPlayerId ||
              currentGame?.pendingAction?.property?.playerId ===
                currentPlayerId) ? (
              <>
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
                  onClick={endTurn}
                  disabled={isLoadingAction}
                  className={`py-3 rounded-xl font-semibold transition-all border text-sm ${
                    !isLoadingAction
                      ? "bg-amber-600/80 border-amber-500/70 text-white shadow-[0_10px_30px_-15px_rgba(245,158,11,0.8)] hover:-translate-y-0.5"
                      : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  🔨 Auction
                </button>
              </>
            ) : (
              <>
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
                  onClick={() => {
                    console.log("properties:", currentGame.properties);
                    if (!isMyTurn) return;
                    const COLOR_GROUP_SIZES = {
                      brown: 2,
                      lightblue: 3,
                      pink: 3,
                      orange: 3,
                      red: 3,
                      yellow: 3,
                      green: 3,
                      blue: 2,
                    };
                    const myProps =
                      currentGame.properties?.filter(
                        (p) => p.ownerId === currentPlayerId,
                      ) || [];
                    const colorCounts = myProps.reduce((acc, p) => {
                      const tile = getTileAtIndex(p.tileIndex);
                      if (tile?.color)
                        acc[tile.color] = (acc[tile.color] || 0) + 1;
                      return acc;
                    }, {});
                    // const hasMonopoly = Object.entries(colorCounts).some(
                    //   ([color, count]) => count === COLOR_GROUP_SIZES[color]
                    // );
                    // if (!hasMonopoly) {
                    //   showNotification("You need a full color set to build!", "info");
                    //   return;
                    // }
                    setShowBuildMenu(true);
                  }}
                  disabled={!isMyTurn}
                  className={`py-3 rounded-xl font-semibold transition-all border text-sm ${
                    isMyTurn
                      ? "bg-orange-500/80 border-orange-400/70 text-white shadow-[0_10px_30px_-15px_rgba(249,115,22,0.8)] hover:-translate-y-0.5"
                      : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  🏗️ Build
                </button>
              </>
            )}

            <button
              onClick={() => {
                setShowTradeModal(true);
                // Default to "all" tab to show public trades, or "incoming" if player has pending trades
                setTradeTab(
                  (currentGame?.pendingTrades || []).some(
                    (t) => t.targetPlayerId === currentPlayerId,
                  )
                    ? "incoming"
                    : (currentGame?.pendingTrades || []).length > 0
                      ? "all"
                      : "new",
                );
              }}
              className={`py-3 rounded-xl font-semibold transition-all border text-sm relative ${
                isMyTurn ||
                (currentGame?.pendingTrades || []).some(
                  (t) => t.targetPlayerId === currentPlayerId,
                )
                  ? "bg-indigo-500/80 border-indigo-400/70 text-white shadow-[0_10px_30px_-15px_rgba(99,102,241,0.8)] hover:-translate-y-0.5"
                  : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              🤝 Trade
              {(currentGame?.pendingTrades || []).filter(
                (t) => t.targetPlayerId === currentPlayerId,
              ).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {
                    (currentGame?.pendingTrades || []).filter(
                      (t) => t.targetPlayerId === currentPlayerId,
                    ).length
                  }
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setMortgageTab("mortgage");
                setSelectedMortgageTiles([]);
                setShowMortgageModal(true);
              }}
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
                      prop.playerId === currentPlayerId,
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
                  {_showPropertyCard.tile.price &&
                    (() => {
                      const mortgageValue = Math.floor(
                        _showPropertyCard.tile.price / 2,
                      );
                      const unmortgageCost = Math.floor(mortgageValue * 1.1);
                      const tileIndex = _showPropertyCard.index;
                      const selectedProperty = currentGame?.properties?.find(
                        (prop) =>
                          prop.tileIndex === tileIndex ||
                          prop.propertyId === tileIndex ||
                          prop.tile === tileIndex,
                      );
                      const ownerId =
                        selectedProperty?.ownerId ||
                        selectedProperty?.owner ||
                        selectedProperty?.playerId;
                      const isOwnedByMe = ownerId === currentPlayerId;
                      const isMortgaged =
                        selectedProperty?.isMortgaged ??
                        selectedProperty?.isMortaged ??
                        false;
                      const hasBuildings =
                        (selectedProperty?.houses ?? 0) > 0 ||
                        (selectedProperty?.hotel ?? 0) > 0;
                      const canMortgage =
                        isOwnedByMe && !isMortgaged && !hasBuildings;
                      const canUnmortgage =
                        isOwnedByMe &&
                        isMortgaged &&
                        (currentPlayer?.money ?? 0) >= unmortgageCost;

                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Mortgage</span>
                            <span className="text-white font-semibold">
                              ${mortgageValue}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Unmortgage</span>
                            <span className="text-white font-semibold">
                              ${unmortgageCost}
                            </span>
                          </div>
                          {isOwnedByMe && (
                            <div className="flex gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => mortgageProperty(tileIndex)}
                                disabled={!canMortgage}
                                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all border ${
                                  canMortgage
                                    ? "bg-amber-500/20 border-amber-400/40 text-amber-200 hover:bg-amber-500/30"
                                    : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                Mortgage
                              </button>
                              <button
                                type="button"
                                onClick={() => unmortgageProperty(tileIndex)}
                                disabled={!canUnmortgage}
                                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all border ${
                                  canUnmortgage
                                    ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30"
                                    : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                Unmortgage
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
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
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
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
                    <div key={idx} className="w-full h-full relative shrink-0">
                      <img
                        src={tile.image}
                        alt={tile.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent flex items-end p-4">
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

      {/* Auction Modal */}
      {currentGame?.pendingAction?.type === "AUCTION" && (
        <AuctionModal
          auction={currentGame.pendingAction.auction}
          currentPlayerId={currentPlayerId}
          onPlaceBid={(amount) => {
            wsClient.send({
              type: "PLACE_BID",
              gameId: currentGame.id,
              playerId: currentPlayerId,
              amount: amount,
            });
          }}
          onTimeout={() => {
            wsClient.send({
              type: "AUCTION_TIMEOUT",
              gameId: currentGame.id,
            });
          }}
        />
      )}

      {/* Build Menu Modal */}
      {showBuildMenu && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowBuildMenu(false)} // click backdrop to close
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()} // prevent backdrop click from firing inside
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">
                🏗️ Build Structures
              </h2>
              <button
                onClick={() => setShowBuildMenu(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <BuildMenu
              currentPlayerId={currentPlayerId}
              properties={currentGame.properties.map((prop) => {
                const tile = getTileAtIndex(prop.tileIndex);
                return {
                  id: prop.tileIndex,
                  name: tile?.title,
                  color: tile?.group,
                  housePrice: tile?.houseCost,
                  houses: prop.houses ?? 0,
                  hotel: prop.hotel ?? 0,
                  isMortgaged: prop.isMortgaged ?? false,
                  ownerId: prop.ownerId,
                };
              })}
              onBuild={(propertyId, buildType) => {
                wsClient.send({
                  type: "BUILD_PROPERTY",
                  gameId: currentGame.id,
                  playerId: currentPlayerId,
                  tileIndex: propertyId,
                });
                setShowBuildMenu(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Mortgage / Unmortgage Modal */}
      {showMortgageModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMortgageModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">
                💰 Mortgage Center
              </h2>
              <button
                onClick={() => setShowMortgageModal(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex gap-4 mb-4 border-b border-slate-700 pb-2">
              <button
                onClick={() => {
                  setMortgageTab("mortgage");
                  setSelectedMortgageTiles([]);
                }}
                className={`px-4 py-2 font-semibold transition-colors ${
                  mortgageTab === "mortgage"
                    ? "text-amber-300 border-b-2 border-amber-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Mortgage
              </button>
              <button
                onClick={() => {
                  setMortgageTab("unmortgage");
                  setSelectedMortgageTiles([]);
                }}
                className={`px-4 py-2 font-semibold transition-colors ${
                  mortgageTab === "unmortgage"
                    ? "text-emerald-300 border-b-2 border-emerald-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Unmortgage
              </button>
            </div>

            {(() => {
              const myProperties =
                currentGame?.properties?.filter(
                  (prop) =>
                    prop.ownerId === currentPlayerId ||
                    prop.owner === currentPlayerId ||
                    prop.playerId === currentPlayerId,
                ) || [];

              const eligibleProperties = myProperties.filter((prop) => {
                const isMortgaged =
                  prop.isMortgaged ?? prop.isMortaged ?? false;
                const hasBuildings =
                  (prop.houses ?? 0) > 0 || (prop.hotel ?? 0) > 0;
                return mortgageTab === "mortgage"
                  ? !isMortgaged && !hasBuildings
                  : isMortgaged;
              });

              const selectedProperties = eligibleProperties.filter((prop) => {
                const tileIndex =
                  prop.tileIndex ?? prop.propertyId ?? prop.tile;
                return selectedMortgageTiles.includes(tileIndex);
              });

              const selectedTiles = selectedProperties.map((prop) => {
                const tileIndex =
                  prop.tileIndex ?? prop.propertyId ?? prop.tile;
                return {
                  tileIndex,
                  tile: getTileAtIndex(tileIndex),
                };
              });

              const currentMoney = currentPlayer?.money ?? 0;
              const totalMortgageValue = selectedTiles.reduce((sum, item) => {
                const price = item.tile?.price ?? 0;
                return sum + Math.floor(price / 2);
              }, 0);
              const totalUnmortgageCost = selectedTiles.reduce((sum, item) => {
                const price = item.tile?.price ?? 0;
                const mortgageValue = Math.floor(price / 2);
                return sum + Math.floor(mortgageValue * 1.1);
              }, 0);
              const nextMoney =
                mortgageTab === "mortgage"
                  ? currentMoney + totalMortgageValue
                  : currentMoney - totalUnmortgageCost;
              const canConfirm =
                selectedProperties.length > 0 &&
                (mortgageTab === "mortgage" ||
                  currentMoney >= totalUnmortgageCost);

              return (
                <>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {eligibleProperties.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">
                        No properties available
                      </p>
                    ) : (
                      eligibleProperties.map((prop) => {
                        const tileIndex =
                          prop.tileIndex ?? prop.propertyId ?? prop.tile;
                        const tile = getTileAtIndex(tileIndex);
                        const value = Math.floor((tile?.price ?? 0) / 2);
                        const cost = Math.floor(value * 1.1);
                        const isSelected =
                          selectedMortgageTiles.includes(tileIndex);

                        return (
                          <button
                            type="button"
                            key={`${tileIndex}-${prop.ownerId}`}
                            onClick={() => {
                              setSelectedMortgageTiles((prev) =>
                                prev.includes(tileIndex)
                                  ? prev.filter((id) => id !== tileIndex)
                                  : [...prev, tileIndex],
                              );
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                              isSelected
                                ? "border-amber-400/60 bg-amber-500/10 text-white"
                                : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">
                                {tile?.title || `Tile #${tileIndex}`}
                              </span>
                              <span className="text-xs text-gray-400">
                                {mortgageTab === "mortgage"
                                  ? `+$${value}`
                                  : `-$${cost}`}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Money</span>
                      <span className="text-white font-semibold">
                        Rs. {currentMoney.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">After Action</span>
                      <span className="text-white font-semibold">
                        Rs. {nextMoney.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowMortgageModal(false)}
                      className="px-5 py-2.5 rounded-lg bg-slate-800 text-gray-200 border border-slate-700 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!canConfirm}
                      onClick={() => {
                        if (!canConfirm) return;
                        selectedProperties.forEach((prop) => {
                          const tileIndex =
                            prop.tileIndex ?? prop.propertyId ?? prop.tile;
                          if (mortgageTab === "mortgage") {
                            mortgageProperty(tileIndex);
                          } else {
                            unmortgageProperty(tileIndex);
                          }
                        });
                        setShowMortgageModal(false);
                      }}
                      className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                        canConfirm
                          ? mortgageTab === "mortgage"
                            ? "bg-amber-500 text-white hover:bg-amber-400"
                            : "bg-emerald-500 text-white hover:bg-emerald-400"
                          : "bg-slate-700 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-md">
          <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl p-6 max-w-4xl w-full mx-4 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700/50">
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  🤝 Trade Center
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Negotiate deals with other players
                </p>
              </div>
              <button
                onClick={() => setShowTradeModal(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="flex pt-4 gap-2 mb-6 border-b border-slate-700 pb-0 overflow-x-auto">
              <button
                onClick={() => setTradeTab("new")}
                className={`px-3 py-2.5 font-semibold transition-all rounded-t-lg whitespace-nowrap ${
                  tradeTab === "new"
                    ? "text-indigo-400 bg-slate-800/50 border-b-2 border-indigo-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/30"
                }`}
              >
                📝 New Trade
              </button>
              <button
                onClick={() => setTradeTab("all")}
                className={`px-3 py-2.5 font-semibold transition-all rounded-t-lg relative whitespace-nowrap ${
                  tradeTab === "all"
                    ? "text-indigo-400 bg-slate-800/50 border-b-2 border-indigo-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/30"
                }`}
              >
                👁️ All Trades
                {(currentGame?.pendingTrades || []).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {(currentGame?.pendingTrades || []).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTradeTab("incoming")}
                className={`px-3 py-2.5 font-semibold transition-all rounded-t-lg relative whitespace-nowrap ${
                  tradeTab === "incoming"
                    ? "text-indigo-400 bg-slate-800/50 border-b-2 border-indigo-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/30"
                }`}
              >
                📥 Incoming
                {(currentGame?.pendingTrades || []).filter(
                  (t) => t.targetPlayerId === currentPlayerId,
                ).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {
                      (currentGame?.pendingTrades || []).filter(
                        (t) => t.targetPlayerId === currentPlayerId,
                      ).length
                    }
                  </span>
                )}
              </button>
              <button
                onClick={() => setTradeTab("outgoing")}
                className={`px-3 py-2.5 font-semibold transition-all rounded-t-lg relative whitespace-nowrap ${
                  tradeTab === "outgoing"
                    ? "text-indigo-400 bg-slate-800/50 border-b-2 border-indigo-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/30"
                }`}
              >
                📤 Outgoing
                {(currentGame?.pendingTrades || []).filter(
                  (t) => t.initiatingPlayerId === currentPlayerId,
                ).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {
                      (currentGame?.pendingTrades || []).filter(
                        (t) => t.initiatingPlayerId === currentPlayerId,
                      ).length
                    }
                  </span>
                )}
              </button>
            </div>

            {tradeTab === "new" ? (
              <div className="space-y-6">
                <div className="bg-linear-to-br from-slate-800/40 to-slate-800/20 border border-slate-700/50 rounded-xl p-4">
                  <label className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <span>👥</span> Select Trading Partner
                  </label>
                  <select
                    value={tradeTargetPlayerId}
                    onChange={(e) => setTradeTargetPlayerId(e.target.value)}
                    className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Choose a player...</option>
                    {currentGame.players
                      .filter((p) => p.id !== currentPlayerId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Your Offer */}
                  <div className="border border-indigo-500/30 rounded-xl p-5 bg-linear-to-br from-indigo-900/20 via-slate-800/40 to-slate-800/20 shadow-lg">
                    <h3 className="font-bold mb-4 text-indigo-300 text-lg flex items-center gap-2">
                      <span>📦</span> Your Offer
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                          <span>💰</span> Money
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-lg">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={tradeOfferMoney}
                            onChange={(e) => setTradeOfferMoney(e.target.value)}
                            placeholder="0"
                            className="w-full pl-8 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                          <span>🏠</span> Properties
                        </label>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                          {currentGame.properties
                            ?.filter(
                              (p) =>
                                p.ownerId === currentPlayerId &&
                                !p.houses &&
                                !p.hotel,
                            )
                            .map((p) => {
                              const tile = getTileAtIndex(p.tileIndex);
                              const isSelected = tradeOfferProperties.includes(
                                p.tileIndex,
                              );
                              return (
                                <button
                                  key={p.tileIndex}
                                  onClick={() => {
                                    if (isSelected) {
                                      setTradeOfferProperties(
                                        tradeOfferProperties.filter(
                                          (id) => id !== p.tileIndex,
                                        ),
                                      );
                                    } else {
                                      setTradeOfferProperties([
                                        ...tradeOfferProperties,
                                        p.tileIndex,
                                      ]);
                                    }
                                  }}
                                  className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all transform hover:scale-[1.02] ${
                                    isSelected
                                      ? "bg-indigo-500/30 border-2 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                                      : "bg-slate-800/50 border border-slate-700 text-gray-300 hover:bg-slate-700/50 hover:border-slate-600"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                      {tile?.title}
                                    </span>
                                    {isSelected && (
                                      <span className="text-indigo-300 text-lg">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          {(!currentGame.properties ||
                            currentGame.properties.filter(
                              (p) =>
                                p.ownerId === currentPlayerId &&
                                !p.houses &&
                                !p.hotel,
                            ).length === 0) && (
                            <div className="text-center py-6 text-gray-500 italic text-sm bg-slate-800/30 rounded-lg border border-slate-700/50">
                              No tradable properties
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Their Offer */}
                  <div className="border border-amber-500/30 rounded-xl p-5 bg-linear-to-br from-amber-900/20 via-slate-800/40 to-slate-800/20 shadow-lg">
                    <h3 className="font-bold mb-4 text-amber-300 text-lg flex items-center gap-2">
                      <span>🎯</span> You Request
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                          <span>💰</span> Money
                        </label>
                        <div className="relative">
                          <span
                            className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-lg transition-colors ${
                              tradeTargetPlayerId
                                ? "text-amber-400"
                                : "text-gray-600"
                            }`}
                          >
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={tradeRequestMoney}
                            onChange={(e) =>
                              setTradeRequestMoney(e.target.value)
                            }
                            placeholder="0"
                            className={`w-full pl-8 pr-3 py-2.5 bg-slate-900/80 border rounded-lg font-semibold focus:outline-none transition-all ${
                              tradeTargetPlayerId
                                ? "border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                : "border-slate-800 text-gray-600 cursor-not-allowed"
                            }`}
                            disabled={!tradeTargetPlayerId}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                          <span>🏠</span> Properties
                        </label>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                          {tradeTargetPlayerId ? (
                            currentGame.properties
                              ?.filter(
                                (p) =>
                                  p.ownerId === tradeTargetPlayerId &&
                                  !p.houses &&
                                  !p.hotel,
                              )
                              .map((p) => {
                                const tile = getTileAtIndex(p.tileIndex);
                                const isSelected =
                                  tradeRequestProperties.includes(p.tileIndex);
                                return (
                                  <button
                                    key={p.tileIndex}
                                    onClick={() => {
                                      if (isSelected) {
                                        setTradeRequestProperties(
                                          tradeRequestProperties.filter(
                                            (id) => id !== p.tileIndex,
                                          ),
                                        );
                                      } else {
                                        setTradeRequestProperties([
                                          ...tradeRequestProperties,
                                          p.tileIndex,
                                        ]);
                                      }
                                    }}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all transform hover:scale-[1.02] ${
                                      isSelected
                                        ? "bg-amber-500/30 border-2 border-amber-400 text-white shadow-lg shadow-amber-500/20"
                                        : "bg-slate-800/50 border border-slate-700 text-gray-300 hover:bg-slate-700/50 hover:border-slate-600"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">
                                        {tile?.title}
                                      </span>
                                      {isSelected && (
                                        <span className="text-amber-300 text-lg">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })
                          ) : (
                            <div className="text-center py-6 text-gray-500 italic text-sm bg-slate-800/30 rounded-lg border border-slate-700/50">
                              Select a player first
                            </div>
                          )}
                          {tradeTargetPlayerId &&
                            (!currentGame.properties ||
                              currentGame.properties.filter(
                                (p) =>
                                  p.ownerId === tradeTargetPlayerId &&
                                  !p.houses &&
                                  !p.hotel,
                              ).length === 0) && (
                              <div className="text-center py-6 text-gray-500 italic text-sm bg-slate-800/30 rounded-lg border border-slate-700/50">
                                No tradable properties
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-700/50">
                  <button
                    onClick={() => setShowTradeModal(false)}
                    className="px-6 py-3 text-gray-300 bg-slate-800 rounded-lg font-semibold hover:bg-slate-700 transition-all hover:scale-105 border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={proposeTrade}
                    disabled={!tradeTargetPlayerId}
                    className={`px-8 py-3 rounded-lg font-bold transition-all transform ${
                      tradeTargetPlayerId
                        ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:scale-105 shadow-lg shadow-indigo-500/30"
                        : "bg-slate-700 text-gray-500 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🚀</span> Propose Trade
                    </span>
                  </button>
                </div>
              </div>
            ) : tradeTab === "all" ? (
              <div className="space-y-4">
                {(currentGame?.pendingTrades || []).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">🤝</div>
                    <p className="text-lg font-semibold mb-1">
                      No active trades
                    </p>
                    <p className="text-sm text-gray-500">
                      All trade offers in the game will appear here
                    </p>
                  </div>
                ) : (
                  (currentGame?.pendingTrades || []).map((trade) => {
                    const initiator = currentGame.players.find(
                      (p) => p.id === trade.initiatingPlayerId,
                    );
                    const targetPlayer = currentGame.players.find(
                      (p) => p.id === trade.targetPlayerId,
                    );
                    const isMyTrade =
                      trade.initiatingPlayerId === currentPlayerId ||
                      trade.targetPlayerId === currentPlayerId;
                    const isInitiator =
                      trade.initiatingPlayerId === currentPlayerId;
                    const isTarget = trade.targetPlayerId === currentPlayerId;

                    return (
                      <div
                        key={trade.tradeId}
                        className={`border rounded-xl p-5 transition-all shadow-lg ${
                          isMyTrade
                            ? "border-indigo-500/50 bg-linear-to-br from-indigo-900/20 to-slate-800/30"
                            : "border-slate-700 bg-linear-to-br from-slate-800/50 to-slate-800/30 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white text-lg">
                                  {initiator?.name || "Unknown"}
                                </h3>
                                <span className="text-gray-400">→</span>
                                <h3 className="font-bold text-white text-lg">
                                  {targetPlayer?.name || "Unknown"}
                                </h3>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {isInitiator
                                  ? "You initiated this trade"
                                  : isTarget
                                    ? "Trade offer for you"
                                    : "Active trade offer"}
                              </p>
                            </div>
                          </div>
                          {isMyTrade && (
                            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full border border-indigo-500/30">
                              Your Trade
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div className="bg-indigo-500/5 rounded-lg p-4 border border-indigo-500/20">
                            <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                              <span>📦</span> {initiator?.name} Offers
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-2">
                              {trade.offerMoney > 0 && (
                                <li className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
                                  <span>💰</span>
                                  <span className="font-semibold">
                                    ${trade.offerMoney}
                                  </span>
                                </li>
                              )}
                              {trade.offerProperties?.map((propId) => {
                                const tile = getTileAtIndex(propId);
                                return (
                                  <li
                                    key={propId}
                                    className="flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded"
                                  >
                                    <span>🏠</span>
                                    <span>{tile?.title}</span>
                                  </li>
                                );
                              })}
                              {trade.offerMoney === 0 &&
                                (!trade.offerProperties ||
                                  trade.offerProperties.length === 0) && (
                                  <li className="text-gray-500 italic text-center py-2">
                                    Nothing offered
                                  </li>
                                )}
                            </ul>
                          </div>
                          <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/20">
                            <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                              <span>🎯</span> {initiator?.name} Requests
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-2">
                              {trade.requestMoney > 0 && (
                                <li className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20">
                                  <span>💰</span>
                                  <span className="font-semibold">
                                    ${trade.requestMoney}
                                  </span>
                                </li>
                              )}
                              {trade.requestProperties?.map((propId) => {
                                const tile = getTileAtIndex(propId);
                                return (
                                  <li
                                    key={propId}
                                    className="flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded"
                                  >
                                    <span>🏠</span>
                                    <span>{tile?.title}</span>
                                  </li>
                                );
                              })}
                              {trade.requestMoney === 0 &&
                                (!trade.requestProperties ||
                                  trade.requestProperties.length === 0) && (
                                  <li className="text-gray-500 italic text-center py-2">
                                    Nothing requested
                                  </li>
                                )}
                            </ul>
                          </div>
                        </div>
                        {isTarget && (
                          <div className="flex gap-3 justify-end pt-3 border-t border-slate-700">
                            <button
                              onClick={() =>
                                finalizeTrade(trade.tradeId, "REJECT")
                              }
                              className="px-5 py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-semibold transition-all hover:scale-105 border border-red-500/30"
                            >
                              ✕ Reject
                            </button>
                            <button
                              onClick={() => {
                                finalizeTrade(trade.tradeId, "ACCEPT");
                                setShowTradeModal(false);
                              }}
                              className="px-5 py-2.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-semibold transition-all hover:scale-105 border border-emerald-500/30"
                            >
                              ✓ Accept
                            </button>
                          </div>
                        )}
                        {isInitiator && (
                          <div className="flex gap-3 justify-end pt-3 border-t border-slate-700">
                            <button
                              onClick={() => deleteTrade(trade.tradeId)}
                              className="px-5 py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-semibold transition-all hover:scale-105 border border-red-500/30 flex items-center gap-2"
                            >
                              <span>🗑️</span> Cancel Offer
                            </button>
                          </div>
                        )}
                        {!isMyTrade && (
                          <div className="flex justify-center pt-3 border-t border-slate-700">
                            <p className="text-xs text-gray-500 italic">
                              Waiting for {targetPlayer?.name} to respond...
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : tradeTab === "incoming" ? (
              <div className="space-y-4">
                {(currentGame?.pendingTrades || []).filter(
                  (t) => t.targetPlayerId === currentPlayerId,
                ).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-lg font-semibold mb-1">
                      No incoming trade offers
                    </p>
                    <p className="text-sm text-gray-500">
                      Trade offers from other players will appear here
                    </p>
                  </div>
                ) : (
                  (currentGame?.pendingTrades || [])
                    .filter((t) => t.targetPlayerId === currentPlayerId)
                    .map((trade) => {
                      const initiator = currentGame.players.find(
                        (p) => p.id === trade.initiatingPlayerId,
                      );
                      return (
                        <div
                          key={trade.tradeId}
                          className="border border-slate-700 rounded-xl p-5 bg-linear-to-br from-slate-800/50 to-slate-800/30 hover:border-slate-600 transition-all shadow-lg"
                        >
                          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
                            <div>
                              <h3 className="font-bold text-white text-lg">
                                {initiator?.name || "Unknown"}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5">
                                wants to trade with you
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="bg-indigo-500/5 rounded-lg p-4 border border-indigo-500/20">
                              <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                                <span>📦</span> They Offer
                              </h4>
                              <ul className="text-sm text-gray-300 space-y-2">
                                {trade.offerMoney > 0 && (
                                  <li className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
                                    <span>💰</span>
                                    <span className="font-semibold">
                                      ${trade.offerMoney}
                                    </span>
                                  </li>
                                )}
                                {trade.offerProperties?.map((propId) => {
                                  const tile = getTileAtIndex(propId);
                                  return (
                                    <li
                                      key={propId}
                                      className="flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded"
                                    >
                                      <span>🏠</span>
                                      <span>{tile?.title}</span>
                                    </li>
                                  );
                                })}
                                {trade.offerMoney === 0 &&
                                  (!trade.offerProperties ||
                                    trade.offerProperties.length === 0) && (
                                    <li className="text-gray-500 italic text-center py-2">
                                      Nothing offered
                                    </li>
                                  )}
                              </ul>
                            </div>
                            <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/20">
                              <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                                <span>🎯</span> They Request
                              </h4>
                              <ul className="text-sm text-gray-300 space-y-2">
                                {trade.requestMoney > 0 && (
                                  <li className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20">
                                    <span>💰</span>
                                    <span className="font-semibold">
                                      ${trade.requestMoney}
                                    </span>
                                  </li>
                                )}
                                {trade.requestProperties?.map((propId) => {
                                  const tile = getTileAtIndex(propId);
                                  return (
                                    <li
                                      key={propId}
                                      className="flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded"
                                    >
                                      <span>🏠</span>
                                      <span>{tile?.title}</span>
                                    </li>
                                  );
                                })}
                                {trade.requestMoney === 0 &&
                                  (!trade.requestProperties ||
                                    trade.requestProperties.length === 0) && (
                                    <li className="text-gray-500 italic text-center py-2">
                                      Nothing requested
                                    </li>
                                  )}
                              </ul>
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end pt-3 border-t border-slate-700">
                            <button
                              onClick={() =>
                                finalizeTrade(trade.tradeId, "REJECT")
                              }
                              className="px-5 py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-semibold transition-all hover:scale-105 border border-red-500/30"
                            >
                              ✕ Reject
                            </button>
                            <button
                              onClick={() => {
                                finalizeTrade(trade.tradeId, "ACCEPT");
                                setShowTradeModal(false);
                              }}
                              className="px-5 py-2.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-semibold transition-all hover:scale-105 border border-emerald-500/30"
                            >
                              ✓ Accept
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(currentGame?.pendingTrades || []).filter(
                  (t) => t.initiatingPlayerId === currentPlayerId,
                ).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">📤</div>
                    <p className="text-lg font-semibold mb-1">
                      No outgoing trade offers
                    </p>
                    <p className="text-sm text-gray-500">
                      Your active trade proposals will appear here
                    </p>
                  </div>
                ) : (
                  (currentGame?.pendingTrades || [])
                    .filter((t) => t.initiatingPlayerId === currentPlayerId)
                    .map((trade) => {
                      const targetPlayer = currentGame.players.find(
                        (p) => p.id === trade.targetPlayerId,
                      );
                      return (
                        <div
                          key={trade.tradeId}
                          className="border border-slate-700 rounded-xl p-5 bg-linear-to-br from-slate-800/50 to-slate-800/30 hover:border-slate-600 transition-all shadow-lg"
                        >
                          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
                            <div>
                              <h3 className="font-bold text-white text-lg">
                                Offer to {targetPlayer?.name || "Unknown"}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Waiting for response...
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="bg-indigo-500/5 rounded-lg p-4 border border-indigo-500/20">
                              <h4 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                                <span>📦</span> You Offer
                              </h4>
                              <ul className="text-sm text-gray-300 space-y-2">
                                {trade.offerMoney > 0 && (
                                  <li className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
                                    <span>💰</span>
                                    <span className="font-semibold">
                                      ${trade.offerMoney}
                                    </span>
                                  </li>
                                )}
                                {trade.offerProperties?.map((propId) => {
                                  const tile = getTileAtIndex(propId);
                                  return (
                                    <li
                                      key={propId}
                                      className="flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded"
                                    >
                                      <span>🏠</span>
                                      <span>{tile?.title}</span>
                                    </li>
                                  );
                                })}
                                {trade.offerMoney === 0 &&
                                  (!trade.offerProperties ||
                                    trade.offerProperties.length === 0) && (
                                    <li className="text-gray-500 italic text-center py-2">
                                      Nothing offered
                                    </li>
                                  )}
                              </ul>
                            </div>
                            <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/20">
                              <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                                <span>🎯</span> You Request
                              </h4>
                              <ul className="text-sm text-gray-300 space-y-2">
                                {trade.requestMoney > 0 && (
                                  <li className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20">
                                    <span>💰</span>
                                    <span className="font-semibold">
                                      ${trade.requestMoney}
                                    </span>
                                  </li>
                                )}
                                {trade.requestProperties?.map((propId) => {
                                  const tile = getTileAtIndex(propId);
                                  return (
                                    <li
                                      key={propId}
                                      className="flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded"
                                    >
                                      <span>🏠</span>
                                      <span>{tile?.title}</span>
                                    </li>
                                  );
                                })}
                                {trade.requestMoney === 0 &&
                                  (!trade.requestProperties ||
                                    trade.requestProperties.length === 0) && (
                                    <li className="text-gray-500 italic text-center py-2">
                                      Nothing requested
                                    </li>
                                  )}
                              </ul>
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end pt-3 border-t border-slate-700">
                            <button
                              onClick={() => deleteTrade(trade.tradeId)}
                              className="px-5 py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-semibold transition-all hover:scale-105 border border-red-500/30 flex items-center gap-2"
                            >
                              <span>🗑️</span> Cancel Offer
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rules Modal */}
      <Rules isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

export default Game;
