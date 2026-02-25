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
  ChevronRight,
} from "lucide-react";

const Rules = ({ isOpen, onClose }) => {
  const scrollRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const progress = scrollTop / (scrollHeight - clientHeight);
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  if (!isOpen) return null;

  const sections = [
    {
      icon: <Users size={18} />,
      title: "1. Setup",
      rules: [
        "Each player starts with ₨1500.",
        "Move tokens clockwise based on dice rolls.",
        "Starting player is determined randomly.",
        "Requires 2-4 players to begin.",
      ],
    },
    {
      icon: <Dice6 size={18} />,
      title: "2. Movement",
      rules: [
        "Roll two dice to move.",
        "Doubles grant an extra turn.",
        "Rolling doubles 3 times in a row sends you to Jail.",
        "Complete all square actions before ending turn.",
      ],
    },
    {
      icon: <Home size={18} />,
      title: "3. Properties",
      rules: [
        "Land on unowned property to buy at listed price.",
        "If declined, property goes to AUCTION (starts at ₨1).",
        "Own all properties in a color group to double rent.",
        "Ownership is required to build houses/hotels.",
      ],
    },
    {
      icon: <Building2 size={18} />,
      title: "4. Building",
      rules: [
        "Must own the full color set to build houses.",
        "Build evenly: one house on each property before adding a second.",
        "4 Houses = 1 Hotel (Maximum development).",
        "Selling buildings back to the bank returns 50% value.",
      ],
    },
    {
      icon: <AlertCircle size={18} />,
      title: "5. Jail",
      rules: [
        "Sent by landing on 'Go to Jail' or 3x doubles.",
        "Exit by: Rolling doubles, paying ₨50 fine, or waiting 3 turns.",
        "Rent collection remains active while in Jail.",
        "If 3 turns pass without doubles, you must pay ₨50 and move.",
      ],
    },
    {
      icon: <Shield size={18} />,
      title: "6. Bankruptcy",
      rules: [
        "Occurs when debt exceeds total assets (cash + properties).",
        "Sell houses and mortgage properties to stay in game.",
        "If still unable to pay, you are eliminated.",
        "All assets go to the player who bankrupted you.",
      ],
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl  flex flex-col h-[85vh]"
        >
          {/* Header */}
          <div className="p-8 flex justify-between items-center  bg-red-400 rounded-t-4xl">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-[#FFD700] uppercase">
                NE-POLY RULES
              </h1>
              <p className="text-white/90 text-xs font-bold tracking-[0.3em] mt-1">
                OFFICIAL GAMEPLAY DOCUMENT
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-0.5 w-full bg-white/5">
            <div
              ref={progressRef}
              className="h-full bg-[#FFD700] origin-left scale-x-0"
            />
          </div>

          {/* Content */}
          <div
            ref={scrollRef}
            className="flex-1 bg-white overflow-y-auto p-8 space-y-12 custom-scrollbar"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                    <span className="text-blue-600">{section.icon}</span>
                    <h2 className="font-black text-lg text-black uppercase tracking-wider">
                      {section.title}
                    </h2>
                  </div>
                  <ul className="space-y-3">
                    {section.rules.map((rule, ridx) => (
                      <li
                        key={ridx}
                        className="flex gap-3 text-sm font-medium text-black/90 leading-relaxed"
                      >
                        <ChevronRight
                          size={14}
                          className="mt-1 text-blue-600 flex-shrink-0"
                        />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Quick Summary / Legal Footer */}
            <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between gap-6">
              <div className="max-w-xs">
                <h3 className="text-amber-600 font-black text-xs uppercase mb-2">
                  Winning Condition
                </h3>
                <p className="text-black/70 text-xs font-bold uppercase tracking-tight">
                  Be the last player standing. Bankrupt all other players
                  through strategic property development and rent collection.
                </p>
              </div>
              <div className="flex items-end">
                <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
                  SYSTEM_VER_2026_NEPOLY
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 215, 0, 0.3); }
      `,
        }}
      />
    </AnimatePresence>
  );
};

export default Rules;
