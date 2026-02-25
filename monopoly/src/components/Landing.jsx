import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Coins,
  Mountain,
  Dices,
  HelpCircle,
  Play,
  ArrowRight,
  Landmark,
  Compass,
} from "lucide-react";
import Rules from "./Rules";

// --- Bouncy Game Title ---
const GameTitle = () => {
  const letters = "NE-POLY".split("");

  return (
    <div className="flex justify-center items-center mb-2">
      {letters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: -50, opacity: 0, rotate: -10 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{
            duration: 0.6,
            delay: i * 0.1,
            type: "spring",
            stiffness: 200,
            damping: 10,
          }}
          className={`text-5xl sm:text-7xl md:text-8xl font-black uppercase drop-shadow-xl ${
            char === "-" ? "text-white" : "text-[#FFD700]"
          }`}
          style={{
            WebkitTextStroke: "2px #8B0000", // Dark red stroke for that board game pop
            textShadow: "4px 4px 0px #8B0000, 8px 8px 15px rgba(0,0,0,0.5)",
          }}
        >
          {char}
        </motion.span>
      ))}
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
  isProcessing,
}) => {
  const [shouldProceed, setShouldProceed] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // --- Fun Nepal-Themed / Generic Names ---
  const PLAYER_NAMES = [
    "Sherpa",
    "Yeti",
    "Gurkha",
    "Danfe",
    "Everest",
    "Lumbini",
    "Rhino",
    "Tiger",
    "Momo",
    "DalBhat",
    "Patan",
    "Koshi",
    "Gandaki",
    "Karnali",
    "Guras",
  ];

  const generateRandomName = () => {
    const randomName =
      PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
    setNameInput(randomName);
  };

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
    const finalName =
      nameInput.trim() ||
      PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
    setNameInput(finalName);
    setShouldProceed(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#003893] via-[#1a4b9e] to-[#DC143C] font-sans selection:bg-[#FFD700] selection:text-black flex flex-col relative overflow-hidden">
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

      {/* --- TOP NAV --- */}
      <header className="relative z-10 w-full p-4 sm:p-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white/90">
          <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFD700]" />
          <span className="text-sm sm:text-base font-bold tracking-widest uppercase shadow-sm">
            Property Trading Game
          </span>
        </div>
        <button
          onClick={() => setShowRules(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white backdrop-blur-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <HelpCircle size={18} />
          <span className="font-bold text-sm">RULES</span>
        </button>
      </header>

      {/* --- MAIN HERO --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-lg mx-auto">
        {/* Title Area */}
        <div className="text-center mb-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/90 font-bold tracking-[0.3em] uppercase mb-2 text-sm drop-shadow-md"
          >
            Welcome to the Himalayas
          </motion.div>
          <GameTitle />
        </div>

        {/* --- THE PROPERTY CARD (MAIN MENU) --- */}
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
          className="w-full bg-[#FAFAFA] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden  border-white"
        >
          {/* Card Header (Like a Monopoly Property) */}
          <div className="bg-[#DC143C] py-6 px-4 text-center border-b-4 border-black/10">
            <h2 className="text-white font-black text-2xl tracking-widest uppercase drop-shadow-md">
              Player Registry
            </h2>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mt-1">
              Title Deed / Entry Pass
            </p>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase">
                <MapPin size={16} className="text-[#003893]" />
                Your Token Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="E.g. YETI_99"
                  className="flex-1 bg-gray-100 border-2 border-gray-200 focus:border-[#003893] rounded-xl px-4 py-3 text-lg font-bold text-gray-800 placeholder:text-gray-400 outline-none transition-all uppercase"
                />
                <button
                  onClick={generateRandomName}
                  className="bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 rounded-xl px-4 flex items-center justify-center text-gray-600 hover:text-[#003893] transition-colors"
                  title="Roll a random name"
                >
                  <Dices size={24} />
                </button>
              </div>
            </div>

            {/* Room Code Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase">
                <Landmark size={16} className="text-[#DC143C]" />
                Room Code (Optional)
              </label>
              <input
                type="text"
                value={joinGameId}
                onChange={(e) => setJoinGameId(e.target.value)}
                placeholder="Leave blank to create new"
                className="w-full bg-gray-100 border-2 border-gray-200 focus:border-[#DC143C] rounded-xl px-4 py-3 text-lg font-bold text-gray-800 placeholder:text-gray-400 outline-none transition-all uppercase tracking-widest"
              />
            </div>

            {/* Big Action Button */}
            <button
              onClick={handleAction}
              disabled={isProcessing}
              className={`w-full relative group overflow-hidden p-1 transition-all transform active:scale-95 ${
                isProcessing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#003893] via-[#DC143C] to-[#003893] bg-[length:200%_auto] animate-gradient" />
              <div className="relative bg-white/10 backdrop-blur-md text-white font-black text-xl py-4 rounded-lg flex items-center justify-center gap-3 uppercase tracking-wider shadow-inner">
                {isProcessing ? (
                  "Rolling Dice..."
                ) : joinGameId.trim() ? (
                  <>
                    <ArrowRight className="w-6 h-6" /> Join Game
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current" /> Create Lobby
                  </>
                )}
              </div>
            </button>
          </div>
        </motion.div>
      </main>

      {/* --- FOOTER FEATURES --- */}
      <footer className="relative z-10 w-full p-4 sm:p-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4 sm:gap-12 opacity-80">
          <Feature icon={<Mountain />} text="8848m High Stakes" />
          <Feature icon={<Landmark />} text="Buy Heritage Sites" />
          <Feature icon={<Coins />} text="Trade in Rupees" />
        </div>
      </footer>

      <Rules isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Tailwind Custom Animation Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `,
        }}
      />
    </div>
  );
};

const Feature = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-white">
    <div className="text-[#FFD700]">{icon}</div>
    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">
      {text}
    </span>
  </div>
);

export default Landing;
