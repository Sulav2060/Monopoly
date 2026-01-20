import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, 
  Check, 
  Users, 
  Crown, 
  User, 
  Play, 
  Loader2, 
  Share2 
} from "lucide-react";

// --- Animations ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const Lobby = ({ currentGame, currentPlayerId, isHost, onStartGame }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleStartGame = async () => {
    setLoading(true);
    try {
      await onStartGame();
    } catch (error) {
      console.error("Failed to start game:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (currentGame?.id) {
      navigator.clipboard.writeText(currentGame.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const playerCount = currentGame?.players?.length || 0;
  const maxPlayers = 4;
  const progress = (playerCount / maxPlayers) * 100;

  return (
    <div className="min-h-screen w-full bg-[#050505] text-slate-200 relative overflow-hidden font-sans flex items-center justify-center p-4">
      
      {/* --- Background Ambience (Same as Landing) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 50, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* --- Main Card --- */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-2xl blur-lg opacity-50"></div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-[#0F1115]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          
          {/* Header */}
          <div className="p-8 pb-0 text-center space-y-2 flex flex-col items-center justify-center">
  <motion.div
    variants={itemVariants}
    className="pb-5 flex flex-row items-center gap-2 text-emerald-400 tracking-widest uppercase text-3xl font-bold"
  >
    {/* Pulse dot centered */}
    <span className="flex items-center justify-center">
      <span className="relative flex h-2 w-2 items-center justify-center mt-1">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
    </span>

    {/* Title text below the dot */}
    Game Lobby
  </motion.div>

  <motion.p variants={itemVariants} className="text-slate-400">
    Own properties, Be rich, Don't get bankrupt.
  </motion.p>
</div>


          <div className="p-8 space-y-8">
            
            {/* Game ID Section */}
            <motion.div variants={itemVariants} className="group relative">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">
                Room Code
              </label>
              <div 
                onClick={copyToClipboard}
                className="flex items-center justify-between bg-black/50 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-emerald-500/50 transition-colors group-hover:ring-1 group-hover:ring-emerald-500/20"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                    <Share2 size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Share with friends</span>
                    <span className="font-mono text-xl text-white tracking-widest truncate">
                      {currentGame?.id || "LOADING..."}
                    </span>
                  </div>
                </div>
                
                <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                   <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check size={20} className="text-emerald-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Copy size={20} />
                        </motion.div>
                      )}
                   </AnimatePresence>
                </button>
              </div>
            </motion.div>

            {/* Players Section */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Users size={16} />
                  <span className="font-semibold text-sm">Players</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  {playerCount} / {maxPlayers} Ready
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>

              {/* Player List */}
              <div className="space-y-2 min-h-[200px]">
                 <AnimatePresence>
                  {currentGame?.players && currentGame.players.length > 0 ? (
                    currentGame.players.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                          player.id === currentPlayerId 
                            ? "bg-white/10 border-emerald-500/30" 
                            : "bg-white/5 border-white/5"
                        }`}
                      >
                        {/* Avatar / Color */}
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                             player.color ? "" : "bg-gradient-to-br from-slate-600 to-slate-800"
                          }`}
                          style={player.color ? { backgroundColor: player.color } : {}}
                        >
                           <User size={18} className="text-white/80" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{player.name}</span>
                            {index === 0 && (
                               <Crown size={14} className="text-amber-400 fill-amber-400/20" />
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                             {player.id === currentPlayerId ? "It's You" : "Ready to play"}
                          </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-600">
                      <Loader2 className="animate-spin mb-2 opacity-20" size={24} />
                      <p className="text-sm">Waiting for connection...</p>
                    </div>
                  )}
                 </AnimatePresence>
                 
                 {/* Empty Slots */}
                 {Array.from({ length: Math.max(0, maxPlayers - playerCount) }).map((_, i) => (
                    <div key={`empty-${i}`} className="border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center text-slate-700 text-sm">
                       Waiting for player...
                    </div>
                 ))}
              </div>
            </motion.div>

            {/* Footer Actions */}
            <motion.div variants={itemVariants} className="pt-4 border-t border-white/10">
              {isHost ? (
                <button
                  onClick={handleStartGame}
                  disabled={!currentGame?.players || currentGame.players.length < 2 || loading}
                  className={`relative w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                    !currentGame?.players || currentGame.players.length < 2 || loading
                      ? "bg-white/10 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02]"
                  }`}
                >
                   {loading ? (
                     <>
                       <Loader2 className="animate-spin" /> Preparing Board...
                     </>
                   ) : (
                     <>
                       Start Game <Play size={20} fill="black" />
                     </>
                   )}
                </button>
              ) : (
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                   <div className="flex justify-center gap-1 mb-2">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   </div>
                   <p className="text-slate-400 text-sm">Waiting for the host to start...</p>
                </div>
              )}

              {/* Host Warning */}
              {isHost && currentGame?.players?.length < 2 && (
                 <p className="text-center text-xs text-amber-500/80 mt-3">
                   Need at least 2 players to start the game.
                 </p>
              )}
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Lobby;