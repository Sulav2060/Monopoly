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
  Share2,
  Terminal,
  Activity,
  Shield,
  Zap,
  Target,
  ChevronRight
} from "lucide-react";

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

  return (
    <div className="min-h-screen w-full bg-[#0a0a0b] text-[#808080] font-mono selection:bg-[#d4ff00] selection:text-black overflow-hidden flex flex-col">

      {/* --- HEADER --- */}
      <div className="relative z-10 w-full py-6 px-12 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <div className="p-2 bg-[#d4ff00] text-black">
              <Users size={18} />
           </div>
           <div className="text-[10px] font-black tracking-[0.3em] text-white uppercase">Waiting_Room</div>
        </div>
        <div className="hidden sm:flex gap-8 text-[10px] font-bold tracking-widest uppercase">
          <span className="text-[#d4ff00] flex items-center gap-2">
            <Activity size={12}/> {playerCount}/{maxPlayers} PLAYERS_ENTERED
          </span>
        </div>
      </div>

      {/* --- MAIN LOBBY INTERFACE --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        
        <div className="w-full max-w-2xl">
          {/* Room ID Module */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-px bg-[#121214] border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[10px] font-black text-[#d4ff00] tracking-widest uppercase mb-1">Room_Code</span>
              <span className="text-3xl font-black text-white tracking-[0.3em] italic uppercase">
                {currentGame?.id || "------"}
              </span>
            </div>
            
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-[#d4ff00] hover:text-black transition-all border border-white/10 group"
            >
              <span className="text-xs font-bold uppercase tracking-widest">
                {copied ? "CODE_COPIED" : "COPY_ROOM_CODE"}
              </span>
              {copied ? <Check size={16} /> : <Share2 size={16} className="group-hover:rotate-12 transition-transform"/>}
            </button>
          </motion.div>

          {/* Players List Module */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#121214] border-x border-white/10 overflow-hidden"
          >
            <div className="grid grid-cols-1 divide-y divide-white/5">
              <AnimatePresence>
                {currentGame?.players?.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`p-5 flex items-center gap-6 transition-colors ${player.id === currentPlayerId ? 'bg-[#d4ff00]/5' : ''}`}
                  >
                    <div className="flex flex-col items-end min-w-[40px]">
                      <span className="text-[10px] font-bold text-[#444]">0{index + 1}</span>
                      {index === 0 && <Crown size={12} className="text-[#d4ff00]" />}
                    </div>
                    
                    <div 
                      className="w-10 h-10 border-2 flex items-center justify-center text-white" 
                      style={{ borderColor: player.color || '#444' }}
                    >
                      <User size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="text-white font-black uppercase tracking-widest">
                        {player.name} {player.id === currentPlayerId && <span className="text-[#d4ff00] ml-2 text-[10px]">[YOU]</span>}
                      </div>
                      <div className="text-[9px] font-bold text-[#444] uppercase tracking-tighter">Player_Entered // Ready</div>
                    </div>

                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-[#d4ff00] animate-pulse" />
                      <div className="w-1 h-4 bg-[#d4ff00]/40" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Placeholder Slots */}
              {Array.from({ length: Math.max(0, maxPlayers - playerCount) }).map((_, i) => (
                <div key={`empty-${i}`} className="p-5 flex items-center gap-6 opacity-20 grayscale">
                   <div className="min-w-[40px] text-right text-[10px] font-bold">0{playerCount + i + 1}</div>
                   <div className="w-10 h-10 border border-dashed border-white/40 flex items-center justify-center"><User size={20} /></div>
                   <div className="text-[10px] font-bold tracking-[0.3em]">WAITING_FOR_PLAYER...</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Execution Button Module */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-px"
          >
            {isHost ? (
              <button 
                onClick={handleStartGame}
                disabled={playerCount < 2 || loading}
                className="w-full group relative h-20 bg-[#d4ff00] disabled:bg-[#1a1a1c] disabled:text-[#444] transition-all flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                   <div className="w-full h-full bg-[linear-gradient(45deg,black_25%,transparent_25%,transparent_50%,black_50%,black_75%,transparent_75%,transparent)] bg-[length:4px_4px]" />
                </div>
                
                <span className="relative z-10 text-black font-black italic text-2xl tracking-[0.2em] flex items-center gap-4">
                  {loading ? "PREPARING_BOARD..." : playerCount < 2 ? "WAITING_FOR_PLAYERS" : "START_GAME"}
                  <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            ) : (
              <div className="w-full h-20 bg-white/5 border border-white/10 flex items-center justify-center gap-4 italic font-black text-white/40 tracking-widest">
                <Loader2 size={20} className="animate-spin text-[#d4ff00]" />
                WAITING_FOR_HOST_TO_START_GAME...
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Lobby;