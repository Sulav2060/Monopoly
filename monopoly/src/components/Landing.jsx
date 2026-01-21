import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Castle,
  Zap,
  Target, 
  Box, 
  ChevronRight, 
  Terminal, 
  Cpu, 
  Activity,
  Dices
} from "lucide-react";

// --- Gaming Title Animation ---
const FlipTitle = () => {
  const words = ["NE-POLY", "NEPAL", "MONOPOLY"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex justify-center items-center h-[80px] lg:h-[120px]">
      <AnimatePresence mode="popLayout">
        <motion.div key={index} className="flex gap-2">
          {words[index].split("").map((char, i) => (
            <motion.span
              key={`${index}-${i}`}
              initial={{ y: 80, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -80, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.4, delay: i * 0.04, type: "spring", stiffness: 150 }}
              className="inline-block text-[3.5rem] lg:text-[6rem] font-black italic tracking-tighter text-[#d4ff00] drop-shadow-[0_0_15px_rgba(212,255,0,0.4)]"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const Landing = ({ 
  onCreateGame, 
  onJoinGame, 
  nameInput, 
  setNameInput, 
  joinGameId, 
  setJoinGameId, 
  isProcessing 
}) => {
  const [activeField, setActiveField] = useState(null);
  const [shouldProceed, setShouldProceed] = useState(false);

  // --- LOGIC: Player Names ---
  const PLAYER_NAMES = [
    "Bob", "Max", "Leo", "Alex", "Sam", "Emma", "Zoe", "Mia", "Ava", "Ivy",
    "Jack", "Tom", "Dan", "Ben", "Kai", "Lily", "Eva", "Anna", "Nina", "Ren",
    "Rio", "Ash", "Rey", "Sage", "Sky", "Nash", "Beck", "Felix", "Rohan", "Sera"
  ];

  const generateRandomName = () => {
    const randomName = PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
    setNameInput(randomName);
  };

  // --- LOGIC: Handle Action Effect ---
  useEffect(() => {
    if (shouldProceed && nameInput.trim()) {
      if (joinGameId.trim()) {
        onJoinGame({ preventDefault: () => {} });
      } else {
        onCreateGame();
      }
      setShouldProceed(false);
    }
  }, [nameInput, shouldProceed, joinGameId, onJoinGame, onCreateGame]);

  const handleAction = () => {
    const finalName = nameInput.trim() || PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
    setNameInput(finalName);
    setShouldProceed(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0b] text-[#808080] font-mono selection:bg-[#d4ff00] selection:text-black overflow-hidden flex flex-col">
      
      {/* --- HUD BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-30" />
        <div className="absolute inset-0 border-[10px] lg:border-[20px] border-[#1a1a1c]" />
        <motion.div 
          animate={{ y: ["0%", "100%"] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-full h-[1px] bg-[#d4ff00]/10 z-50" 
        />
        <div className="absolute top-8 left-12 flex flex-col gap-1 text-[10px] text-[#d4ff00] font-bold">
           <span>SYSTEM_8848_ACTIVE</span>
           <span>LAT_27.71 | LON_85.32</span>
        </div>
      </div>

      {/* --- HEADER --- */}
      <div className="relative z-10 w-full py-6 px-12 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <div className="p-2 bg-[#d4ff00] text-black">
              <Terminal size={18} />
           </div>
           <div className="text-[10px] font-black tracking-[0.3em] text-white">NE-POLY</div>
        </div>
        <div className="hidden sm:flex gap-8 text-[10px] font-bold tracking-widest uppercase">
          <span className="text-[#d4ff00] flex items-center gap-2"><Activity size={12}/> NEPAL THEMED MONOPOLY</span>
        </div>
      </div>

      {/* --- MAIN INTERFACE --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        
        <div className="text-center mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black tracking-[0.5em] text-[#d4ff00]/60 mb-2 uppercase">
            Start Your Journey
          </motion.div>
          <FlipTitle />
        </div>

        {/* COMMAND MODULE (INPUT HUB) */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-xl bg-[#121214] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* 01: Operator Identity */}
          <div className={`p-6 flex items-center gap-6 transition-all border-b border-white/5 ${activeField === 'name' ? 'bg-[#d4ff00]/5' : ''}`}>
            <div className="flex flex-col items-end min-w-[60px]">
              <span className="text-[10px] font-bold text-[#444]">01</span>
              <span className="text-[10px] font-black text-[#d4ff00]">NAME</span>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <input 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onFocus={() => setActiveField('name')}
                onBlur={() => setActiveField(null)}
                placeholder="Player Name"
                className="w-full bg-transparent border-none outline-none text-white font-black text-xl placeholder:text-white/5 uppercase tracking-tighter"
              />
              <button 
                onClick={generateRandomName}
                title="Randomize Name"
                className="p-2 hover:bg-white/5 rounded text-[#444] hover:text-[#d4ff00] transition-colors"
              >
                <Dices size={20} />
              </button>
            </div>
            <Cpu size={20} className={activeField === 'name' ? 'text-[#d4ff00]' : 'text-[#222]'} />
          </div>

          {/* 02: Deployment Sector */}
          <div className={`p-6 flex items-center gap-6 transition-all border-b border-white/5 ${activeField === 'room' ? 'bg-[#d4ff00]/5' : ''}`}>
             <div className="flex flex-col items-end min-w-[60px]">
              <span className="text-[10px] font-bold text-[#444]">02</span>
              <span className="text-[10px] font-black text-amber-500">ROOM CODE</span>
            </div>
            <input 
              value={joinGameId}
              onChange={(e) => setJoinGameId(e.target.value)}
              onFocus={() => setActiveField('room')}
              onBlur={() => setActiveField(null)}
              placeholder="ENTER ROOM CODE (OR LEAVE BLANK)"
              className="flex-1 bg-transparent border-none outline-none text-white font-bold text-sm placeholder:text-white/5 tracking-widest uppercase"
            />
            <Box size={20} className={activeField === 'room' ? 'text-amber-500' : 'text-[#222]'} />
          </div>

          {/* 03: Execute Button */}
          <button 
            onClick={handleAction}
            disabled={isProcessing}
            className="w-full group relative h-20 bg-[#d4ff00] disabled:bg-[#1a1a1c] disabled:text-[#444] transition-all flex items-center justify-center overflow-hidden"
          >
            {/* Button Background Pattern */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
               <div className="w-full h-full bg-[linear-gradient(45deg,black_25%,transparent_25%,transparent_50%,black_50%,black_75%,transparent_75%,transparent)] bg-[length:4px_4px]" />
            </div>
            
            <span className="relative z-10 text-black font-black italic text-2xl tracking-[0.2em] flex items-center gap-4">
              {isProcessing ? "PROCESSING..." : (joinGameId.trim() ? "JOIN_EXISTING_LOBBY" : "CREATE_NEW_LOBBY")}
              <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
        </motion.div>
      </main>

      {/* --- HUD STATS FOOTER --- */}
      <footer className="relative z-10 bg-[#0a0a0b] border-t border-white/5 px-12 py-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
        <StatBlock icon={<Shield size={16}/>} label="MAP_INTEGRITY" value="100%_NEPAL" />
        <StatBlock icon={<Zap size={16}/>} label="TASK" value="ROLL_TRADE" />
        <StatBlock icon={<Target size={16}/>} label="MISSION" value="PROPERTY_WAR" />
        <StatBlock icon={<Castle size={16}/>} label="GOAL" value="CREATE_EMPIRE" />
      </footer>
    </div>
  );
};

const StatBlock = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 border-l border-white/5 pl-6 hover:border-[#d4ff00] transition-colors group">
    <div className="text-[#333] group-hover:text-[#d4ff00] transition-colors">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[9px] font-bold tracking-[0.2em] text-[#444] uppercase">{label}</span>
      <span className="text-sm font-black text-white group-hover:text-[#d4ff00] uppercase">{value}</span>
    </div>
  </div>
);

export default Landing;