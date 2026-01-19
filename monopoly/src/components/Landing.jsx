import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Dice5, 
  TrendingUp, 
  Building2, 
  ArrowRight, 
  Globe 
} from "lucide-react";

// --- 1. New Flip Title Component ---
const FlipTitle = () => {
  const words = ["NE-POLY", "NEPAL", "MONOPOLY"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col justify-center overflow-hidden h-[1.1em]">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index} // Key change triggers the animation
          className="flex gap-[2px]" // Tight spacing for "logo" feel
        >
          {words[index].split("").map((char, i) => (
            <motion.span
              key={`${index}-${i}`}
              initial={{ y: 50, opacity: 0, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -50, opacity: 0, filter: "blur(10px)" }}
              transition={{
                duration: 0.5,
                delay: i * 0.05, // The "ripple" effect
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 font-black"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
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
  const [activeField, setActiveField] = useState(null);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-slate-200 relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* --- Background Ambience --- */}
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
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-20 flex flex-col justify-center min-h-screen">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-12 gap-12 items-center"
        >
          
          {/* Left Column: Typography & Hook */}
          <div className="lg:col-span-7 space-y-10">

            {/* --- 2. Integrated Title Section --- */}
            <div className="space-y-2">
              
              <div className="text-6xl lg:text-8xl font-bold tracking-tighter leading-none text-white h-[1.1em] flex items-center">
                {/* Fixed part if you wanted one, but here we perform the full flip */}
                <FlipTitle />
              </div>
            </div>

            <motion.p variants={itemVariants} className="text-xl text-slate-400 max-w-2xl leading-relaxed font-light">
              From the bustling streets of <strong className="text-slate-200">Janakpur</strong> to the serene heights of <strong className="text-slate-200">Everest</strong>. Roll the dice, outsmart opponents, and build your empire.
            </motion.p>

            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
               <FeatureCard icon={<Globe className="w-5 h-5 text-blue-400" />} title="Real Places" desc="Terai to Himalayas" />
               <FeatureCard icon={<Building2 className="w-5 h-5 text-amber-400" />} title="Build Assets" desc="Houses & Hotels" />
               <FeatureCard icon={<Dice5 className="w-5 h-5 text-emerald-400" />} title="Strategy" desc="Trade & Tycoon" />
            </motion.div>
          </div>

          {/* Right Column: Glassmorphism Action Card */}
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative bg-[#0F1115]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-8">
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">Start your Journey</h2>
                    <p className="text-sm text-slate-500">Enter your details to enter the lobby.</p>
                  </div>

                  <div className="space-y-5">
                    {/* Name Input */}
                    <div className="relative">
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 ml-1">
                        Player Name
                      </label>
                      <div className={`relative flex items-center transition-all duration-300 rounded-xl bg-black/50 border ${activeField === 'name' ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-white/10'}`}>
                        <div className="pl-4 text-slate-500">
                           <TrendingUp size={18} />
                        </div>
                        <input
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          onFocus={() => setActiveField('name')}
                          onBlur={() => setActiveField(null)}
                          placeholder="e.g. Biraj"
                          className="w-full px-4 py-3.5 bg-transparent text-white placeholder-slate-600 focus:outline-none rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Room Code Input */}
                    <div className="relative">
                      <div className="flex justify-between items-center mb-2 ml-1">
                         <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                           Room Code <span className="text-slate-600 normal-case tracking-normal">(Optional)</span>
                         </label>
                         <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-500">
                           {joinGameId.trim() ? "Joining Mode" : "Creation Mode"}
                         </span>
                      </div>
                      
                      <div className={`relative flex items-center transition-all duration-300 rounded-xl bg-black/50 border ${activeField === 'room' ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-white/10'}`}>
                        <div className="pl-4 text-slate-500">
                           <MapPin size={18} />
                        </div>
                        <input
                          value={joinGameId}
                          onChange={(e) => setJoinGameId(e.target.value)}
                          onFocus={() => setActiveField('room')}
                          onBlur={() => setActiveField(null)}
                          placeholder="e.g. NP-8848"
                          className="w-full px-4 py-3.5 bg-transparent text-white placeholder-slate-600 focus:outline-none rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Main Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!nameInput || isProcessing}
                    onClick={() => joinGameId.trim() ? onJoinGame({ preventDefault: () => {} }) : onCreateGame()}
                    className={`group w-full relative overflow-hidden py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-lg ${
                      !nameInput ? 'opacity-50 cursor-not-allowed grayscale' : ''
                    } ${
                      joinGameId.trim()
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-amber-900/20"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-emerald-900/20"
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isProcessing ? (
                        "Processing..."
                      ) : joinGameId.trim() ? (
                        <>Join Room<ArrowRight size={18} /></>
                      ) : (
                        <>Create New Game <ArrowRight size={18} /></>
                      )}
                    </span>
                  </motion.button>

                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* --- Footer / Showcase --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-6 left-0 right-0 text-center pointer-events-none"
        >
           
        </motion.div>

      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group flex flex-col p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-default">
    <div className="mb-3 opacity-80 group-hover:scale-110 transition-transform duration-300 origin-left">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
    <p className="text-xs text-slate-500 mt-1">{desc}</p>
  </div>
);

export default Landing;