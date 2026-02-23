import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Users,
  Crown,
  Play,
  Loader2,
  Share2,
  Compass,
  Map,
  Ticket,
  ExternalLink,
} from "lucide-react";

// Player color palette
const PLAYER_COLORS = [
  {
    name: "Red",
    color: "bg-red-500",
    borderColor: "border-red-700",
    glow: "rgba(239,68,68,0.6)",
  },
  {
    name: "Blue",
    color: "bg-blue-500",
    borderColor: "border-blue-700",
    glow: "rgba(59,130,246,0.6)",
  },
  {
    name: "Green",
    color: "bg-green-500",
    borderColor: "border-green-700",
    glow: "rgba(34,197,94,0.6)",
  },
  {
    name: "Yellow",
    color: "bg-yellow-400",
    borderColor: "border-yellow-600",
    glow: "rgba(245,158,11,0.65)",
  },
];

// Player Token Avatar Component - matches the board implementation
const PlayerTokenAvatar = ({ color, size = "md", filled = true }) => {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-[3px]",
    lg: "w-14 h-14 border-4",
  };

  const getColorStyle = () => {
    if (!color) {
      return { bg: "bg-gray-200", border: "border-gray-300" };
    }

    if (typeof color === "object" && color.color && color.borderColor) {
      if (filled) {
        return { bg: color.color, border: color.borderColor };
      } else {
        // For unfilled slots, use a dashed border style with reduced opacity
        return {
          bg: color.color + "/20",
          border: color.borderColor + " border-dashed",
        };
      }
    }
    return { bg: "bg-red-500", border: "border-red-900" };
  };

  const { bg, border } = getColorStyle();

  return (
    <div
      className={`${sizeClasses[size]} ${bg} ${border} rounded-full shadow-lg flex items-center justify-center relative overflow-hidden flex-shrink-0 transition-all duration-300 ease-out`}
    >
      {filled ? (
        <>
          {/* Cute bubbly water-drop eyes */}
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            {/* Left eye */}
            <div
              className="w-3 h-3 bg-white rounded-full shadow-md flex items-center justify-center relative"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.7))",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {/* Pupil */}
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              {/* Shine spot */}
              <div
                className="absolute w-0.5 h-0.5 bg-white rounded-full"
                style={{
                  top: "3px",
                  left: "3px",
                  opacity: 0.9,
                }}
              ></div>
            </div>
            {/* Right eye */}
            <div
              className="w-3 h-3 bg-white rounded-full shadow-md flex items-center justify-center relative"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.7))",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {/* Pupil */}
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              {/* Shine spot */}
              <div
                className="absolute w-0.5 h-0.5 bg-white rounded-full"
                style={{
                  top: "3px",
                  left: "3px",
                  opacity: 0.9,
                }}
              ></div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Placeholder eyes - lighter version */}
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-gray-300 rounded-full opacity-60"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full opacity-60"></div>
          </div>
        </>
      )}
    </div>
  );
};

const Lobby = ({ currentGame, currentPlayerId, isHost, onStartGame }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const playerCount = currentGame?.players?.length || 0;
  const maxPlayers = 4;

  const copyToClipboard = () => {
    if (currentGame?.id) {
      const shareUrl = `${window.location.origin}/?join=${currentGame.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#003893] via-[#1a4b9e] to-[#DC143C] font-sans selection:bg-[#FFD700] selection:text-black relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* --- BACKGROUND DECORATIONS --- */}
      {/* Mountain Silhouettes using CSS polygons */}
      <div
        className="absolute bottom-0 left-0 w-full h-64 bg-white/5 clip-mountain-1 pointer-events-none"
        style={{
          clipPath:
            "polygon(0% 100%, 20% 40%, 40% 100%, 60% 20%, 80% 100%, 100% 50%, 100% 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-48 bg-white/10 clip-mountain-2 pointer-events-none"
        style={{
          clipPath:
            "polygon(0% 100%, 15% 60%, 35% 100%, 50% 40%, 75% 100%, 90% 70%, 100% 100%)",
        }}
      />

      {/* Sun/Mandala hint */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-to-tr from-[#FFD700]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl"
      >
        {/* TOP STATUS BAR */}
        <div className="flex justify-between items-end mb-4 px-2">
          <div>
            <h1 className="text-[#FFD700] text-4xl font-black italic tracking-tighter drop-shadow-md">
              NE-POLY
            </h1>
            <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">
              Expedition Waiting Room
            </p>
          </div>
        </div>

        {/* MAIN BOX: HORIZONTAL LAYOUT */}
        <div className="bg-[#F8F9FA] rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row min-h-[450px] border-white">
          {/* LEFT PANEL: ROOM INFO */}
          <div className="w-full md:w-2/5 bg-[#1A1A1A] text-white p-8 flex flex-col justify-between border-r-2 border-dashed border-white/20">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <Ticket className="text-[#FFD700]" size={20} />
                <span className="text-xs font-black uppercase tracking-widest text-white/50">
                  Access Permit
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                  Room Identifier
                </label>
                <div className="text-5xl font-black text-white tracking-widest mb-6">
                  {currentGame?.id || "----"}
                </div>
              </div>

              <button
                onClick={copyToClipboard}
                className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all w-full"
              >
                <div className="bg-[#FFD700] p-2 rounded-lg text-black group-hover:scale-110 transition-transform">
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-white/40 uppercase">
                    Invite Friends
                  </p>
                  <p className="text-xs font-black uppercase">
                    {copied ? "Copied Link!" : "Copy Invite URL"}
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-2">
                  {[...Array(maxPlayers)].map((_, i) => {
                    const playerColor = PLAYER_COLORS[i];
                    const isFilled = i < playerCount;
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-8 h-8 rounded-full border-2 border-[#1A1A1A] transition-all ${
                          isFilled ? playerColor.color : "bg-white/10"
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-white/60">
                  {playerCount}/{maxPlayers} Slots Filled
                </span>
              </div>

              {isHost ? (
                <button
                  disabled={playerCount < 2 || loading}
                  onClick={onStartGame}
                  className="w-full bg-[#DC143C] hover:bg-[#FF1E4A] disabled:opacity-30 disabled:grayscale transition-all text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest shadow-[0_10px_20px_rgba(220,20,60,0.3)]"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Play fill="currentColor" size={18} /> Start Game
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                  <Loader2 size={16} className="animate-spin text-[#FFD700]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Waiting for Host...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: PLAYER LIST */}
          <div className="flex-1 p-8 bg-white relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="text-[#00205B]" size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest text-[#00205B]">
                  Expedition Members
                </h3>
              </div>
              <Map className="text-gray-200" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence>
                {currentGame?.players?.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      player.id === currentPlayerId
                        ? "border-[#00205B] bg-blue-50/50 shadow-sm"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <PlayerTokenAvatar color={player.color} size="md" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-800 uppercase tracking-tight">
                          {player.name}
                        </span>
                        {index === 0 && (
                          <Crown
                            size={14}
                            className="text-[#FFD700] fill-[#FFD700]"
                          />
                        )}
                        {player.id === currentPlayerId && (
                          <span className="text-[8px] bg-[#00205B] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {index === 0 ? "Expedition Leader" : "Member"}
                      </p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* EMPTY SLOTS */}
              {Array.from({
                length: Math.max(0, maxPlayers - playerCount),
              }).map((_, i) => {
                const slotIndex = playerCount + i;
                const predictedColor =
                  PLAYER_COLORS[slotIndex % PLAYER_COLORS.length];
                return (
                  <motion.div
                    key={`empty-${i}`}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-100 opacity-60"
                  >
                    <PlayerTokenAvatar
                      color={predictedColor}
                      size="md"
                      filled={false}
                    />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">
                      Scanning for team...
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* STAMP EFFECT */}
            <div className="absolute bottom-4 right-4 opacity-10 -rotate-12 pointer-events-none">
              <div className="border-4 border-[#DC143C] p-2 rounded-lg text-[#DC143C] font-black text-2xl uppercase">
                Approved
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FOOTER HINT */}
      <p className="relative z-10 mt-8 text-white/30 text-[10px] font-bold uppercase tracking-[0.4em]">
        Pokhara • Kathmandu • Everest • Namche
      </p>
    </div>
  );
};

export default Lobby;
