import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Home,
  DollarSign,
  Users,
  Dice6,
  Gavel,
  Shield,
  TrendingUp,
  Building2,
  Landmark,
  AlertCircle,
} from "lucide-react";

const Rules = ({ isOpen, onClose }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const progressBar = progressRef.current;

    if (!scrollElement || !progressBar) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const totalScrollable = scrollHeight - clientHeight;
      const progress = totalScrollable > 0 ? scrollTop / totalScrollable : 0;

      // Direct DOM update (NO React re-render)
      progressBar.style.transform = `scaleX(${progress})`;
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    // Initial call
    handleScroll();

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sections = [
    {
      icon: <Users size={20} />,
      title: "GAME SETUP",
      color: "#d4ff00",
      rules: [
        "Each player starts with ₨1500 at GO position",
        "Players take turns rolling two dice and moving clockwise",
        "First player to start is chosen randomly",
        "Game needs 2-4 players to begin",
      ],
    },
    {
      icon: <Dice6 size={20} />,
      title: "YOUR TURN",
      color: "#00d4ff",
      rules: [
        "Roll two dice and move that many spaces clockwise",
        "If you roll doubles, you get another turn after completing your actions",
        "Roll doubles three times in a row? Go directly to Jail!",
        "Complete all actions before ending your turn",
      ],
    },
    {
      icon: <Home size={20} />,
      title: "BUYING PROPERTIES",
      color: "#d4ff00",
      rules: [
        "When you land on an unowned property, you can buy it at the listed price",
        "If you don't buy it, the property goes to AUCTION",
        "Property groups: Cities, Lakes, Heritage Sites, National Parks, Airports, Utilities",
        "Own all properties in a color group to build houses and charge more rent",
      ],
    },
    {
      icon: <DollarSign size={20} />,
      title: "RENT & PAYMENTS",
      color: "#00ff88",
      rules: [
        "Landing on another player's property? Pay them rent!",
        "Rent doubles when someone owns all properties in a color group",
        "Rent increases with houses: 1 house, 2 houses, 3 houses, 4 houses, or HOTEL",
        "Can't pay rent? You must declare bankruptcy",
      ],
    },
    {
      icon: <Building2 size={20} />,
      title: "BUILDING HOUSES",
      color: "#ff00aa",
      rules: [
        "You must own ALL properties in a color group before building",
        "Build evenly: Each property must have equal houses before adding more",
        "Maximum: 4 houses per property, then upgrade to 1 hotel",
        "Houses cost varies by property group (₨50-₨200)",
      ],
    },
    {
      icon: <Gavel size={20} />,
      title: "AUCTIONS",
      color: "#ff8800",
      rules: [
        "When a player declines to buy a property, it goes to auction",
        "All players can bid, including the one who declined",
        "Bidding starts at ₨1 and increases in ₨10 increments",
        "Highest bidder wins the property at their bid price",
      ],
    },
    {
      icon: <Landmark size={20} />,
      title: "SPECIAL SPACES",
      color: "#00d4ff",
      rules: [
        "GO: Collect ₨200 every time you pass or land on GO",
        "Community Chest: Draw a card for surprise rewards or penalties",
        "Chance: Draw a card that could help or hurt you",
        "Jail: Visit = safe, Sent to Jail = stuck for 3 turns or pay ₨50",
        "Free Parking: Safe space, just visiting",
        "Tax: Pay ₨200 when you land here",
      ],
    },
    {
      icon: <AlertCircle size={20} />,
      title: "JAIL RULES",
      color: "#ff4444",
      rules: [
        "Sent to jail by: Landing on 'Go to Jail', drawing a Jail card, or rolling doubles 3 times",
        "Get out by: Rolling doubles, paying ₨50 fine, or waiting 3 turns",
        "You can still collect rent while in jail",
        "After 3 failed turns, you must pay ₨50 and move",
      ],
    },
    {
      icon: <Shield size={20} />,
      title: "BANKRUPTCY",
      color: "#ff0000",
      rules: [
        "Can't pay rent or fees? You're bankrupt!",
        "All your properties, houses, and money go to the creditor",
        "If bankrupt to the bank, properties return to auction",
        "You're eliminated from the game",
      ],
    },
    {
      icon: <TrendingUp size={20} />,
      title: "WINNING",
      color: "#d4ff00",
      rules: [
        "Last player remaining with money and properties wins!",
        "Eliminate opponents by bankrupting them",
        "Strategy tip: Complete color groups for maximum rent",
        "Build smart and bankrupt everyone else!",
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0b] border-2 border-[#d4ff00]/20 rounded-none shadow-[0_0_40px_rgba(212,255,0,0.08)] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0a0a0b] border-b-2 border-[#d4ff00]/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black tracking-[0.5em] text-[#d4ff00]/60 mb-2">
                    GAME MANUAL
                  </div>
                  <h1 className="text-4xl font-black italic text-[#d4ff00] tracking-tighter drop-shadow-[0_0_8px_rgba(212,255,0,0.15)]">
                    NE-POLY RULES
                  </h1>
                  <p className="text-sm text-white/60 mt-2 font-mono">
                    Master the game • Conquer Nepal • Build your empire
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-[#d4ff00]/10 rounded-none border border-white/10 hover:border-[#d4ff00] transition-all group"
                  title="Close Rules"
                >
                  <X
                    size={24}
                    className="text-white/60 group-hover:text-[#d4ff00]"
                  />
                </button>
              </div>
            </div>

            {/* Scroll Progress Indicator */}
            <div className="h-1 bg-white/5 relative overflow-hidden">
              <div
                ref={progressRef}
                className="h-full bg-gradient-to-r from-[#d4ff00] to-[#00ff88] shadow-[0_0_10px_rgba(212,255,0,0.8)] origin-left"
                style={{
                  transform: "scaleX(0)",
                  willChange: "transform",
                }}
              />
            </div>

            {/* Scrollable Content */}
            <div
              ref={scrollRef}
              className="rules-content overflow-y-auto max-h-[calc(90vh-140px)] p-6"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {/* Nepal Theme Introduction */}
              <div className="mb-8 p-6 bg-gradient-to-r from-[#d4ff00]/5 to-transparent border-l-4 border-[#d4ff00]/60">
                <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
                  🇳🇵 Welcome to Nepal-themed Monopoly!
                </h2>
                <p className="text-white/70 font-mono text-sm leading-relaxed">
                  Travel across Nepal's most iconic locations—from the sacred
                  temples of Janakpur to the majestic peaks of Everest, from the
                  serene waters of Phewa Lake to the historic sites of
                  Kathmandu. Buy properties, collect rent, and become the
                  ultimate property tycoon of Nepal!
                </p>
              </div>

              {/* Rules Sections */}
              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="bg-[#121214] border border-white/10 hover:border-white/20 transition-all p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="p-2 bg-black/50 border border-white/10"
                        style={{ color: section.color }}
                      >
                        {section.icon}
                      </div>
                      <h3
                        className="text-lg font-black tracking-wider"
                        style={{ color: section.color }}
                      >
                        {section.title}
                      </h3>
                    </div>
                    <ul className="space-y-2 ml-1">
                      {section.rules.map((rule, ruleIndex) => (
                        <li
                          key={ruleIndex}
                          className="flex gap-3 text-white/80 text-sm font-mono leading-relaxed"
                        >
                          <span className="text-[#d4ff00] mt-1 font-bold">
                            ▸
                          </span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Additional Tips */}
              <div className="mt-8 p-6 bg-[#121214] border border-white/20">
                <h3 className="text-xl font-black text-[#d4ff00] mb-4 tracking-wide">
                  💡 PRO TIPS
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-sm text-white/70 font-mono">
                    <span className="text-[#d4ff00] font-bold">→</span> Focus on
                    completing color groups early
                  </div>
                  <div className="text-sm text-white/70 font-mono">
                    <span className="text-[#d4ff00] font-bold">→</span> Airports
                    and utilities provide steady income
                  </div>
                  <div className="text-sm text-white/70 font-mono">
                    <span className="text-[#d4ff00] font-bold">→</span> Don't
                    overbuild—keep cash for rent payments
                  </div>
                  <div className="text-sm text-white/70 font-mono">
                    <span className="text-[#d4ff00] font-bold">→</span> Use
                    auctions strategically to get properties cheap
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-[10px] font-mono text-white/40 tracking-[0.3em]">
                  SYSTEM_8848 | BUILT FOR NEPAL | VERSION 2026
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hide scrollbar styles
const style = document.createElement("style");
style.textContent = `
  .rules-content::-webkit-scrollbar {
    display: none;
  }
  .rules-content {
    scroll-behavior: smooth;
  }
`;
if (!document.getElementById("rules-scrollbar-hide")) {
  style.id = "rules-scrollbar-hide";
  document.head.appendChild(style);
}

export default Rules;
