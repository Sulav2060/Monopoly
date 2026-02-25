import React, { useEffect, useState, useRef } from "react";

const AuctionModal = ({ auction, currentPlayerId, players = [], onPlaceBid, onTimeout }) => {
  const [bidAmount, setBidAmount] = useState(auction.highestBid + 10);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef(null);
  const TIMER_DURATION = 5; 

  // Helper to get player name by ID
  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || `Player ${playerId.slice(-4)}`;
  };

  // Reset timer and bid input when highest bid changes
  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
    setBidAmount(Math.max(bidAmount, auction.highestBid + 10));
  }, [auction.highestBid]);

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [auction.highestBid, onTimeout]);

  const handleBid = () => {
    if (bidAmount > auction.highestBid) {
      onPlaceBid(bidAmount);
    }
  };

  if (!auction) return null;

  const property = auction.property;
  const colorClass = property.color 
    ? `bg-${property.color}-500` 
    : property.type === "railroad" 
      ? "bg-gray-800" 
      : "bg-blue-300";

  // Minimized view (compact bar at bottom)
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom">
        <div 
          onClick={() => setIsMinimized(false)}
          className="bg-linear-to-r from-amber-500 to-orange-500 text-slate-900 px-6 py-3 rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-transform flex items-center gap-3 border-2 border-amber-300"
        >
          <span className="text-2xl">🔨</span>
          <span className="font-bold">Auction: {property.name}</span>
          <div className="bg-slate-900/20 px-3 py-1 rounded-full text-sm font-mono">
            {timeLeft}s
          </div>
          <span className="text-sm opacity-80">Click to bid</span>
        </div>
      </div>
    );
  }

  // Full auction panel (non-blocking side panel)
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Subtle backdrop - only slight dimming */}
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" />
      
      {/* Auction Panel - Bottom on mobile, Right side on desktop */}
      <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:right-4 md:top-1/2 md:-translate-y-1/2 md:left-auto md:w-96 pointer-events-auto animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
        <div className="bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/50 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-linear-to-r from-amber-500 to-orange-500 p-4">
            <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔨</span>
                <div>
                  <div className="text-slate-900 font-bold text-sm">LIVE AUCTION</div>
                  <div className="text-slate-800 text-xs">Highest bid wins</div>
                </div>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="bg-slate-900/30 hover:bg-slate-900/50 text-slate-900 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Minimize
              </button>
            </div>
          </div>

          {/* Property Info Card */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="bg-slate-800/80 rounded-xl overflow-hidden border border-slate-700">
              {/* Property color strip */}
              {property.color && (
                <div className={`h-2 ${colorClass}`} />
              )}
              <div className="p-3">
                <h3 className="text-white font-bold text-lg mb-1">{property.name}</h3>
                <div className="flex gap-2 text-xs">
                  <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded">
                    {property.type === "property" ? "Property" : property.type === "railroad" ? "Railroad" : "Utility"}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-mono">
                    Listed: Rs. {property.price}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Auction Status */}
          <div className="p-4 bg-slate-800/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="text-slate-400 text-xs mb-1">Current Highest Bid</div>
                <div className="text-3xl font-mono font-bold text-emerald-400">
                  Rs. {auction.highestBid}
                </div>
                {auction.highestBidderId && (
                  <div className="text-xs text-slate-500 mt-1">
                    {auction.highestBidderId === currentPlayerId ? (
                      <span className="text-emerald-400">✓ You're winning!</span>
                    ) : (
                      <span>{getPlayerName(auction.highestBidderId)}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-xs mb-1">Time Left</div>
                <div className={`text-4xl font-bold transition-all ${
                  timeLeft <= 3 
                    ? "text-red-500 animate-pulse scale-110" 
                    : timeLeft <= 5
                      ? "text-orange-400"
                      : "text-white"
                }`}>
                  {timeLeft}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 3 ? "bg-red-500" : timeLeft <= 5 ? "bg-orange-400" : "bg-emerald-500"
                }`}
                style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
              />
            </div>
          </div>

          {/* Bidding Controls */}
          <div className="p-4 space-y-3">
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setBidAmount(amount => Math.max(auction.highestBid + 1, amount - 5))}
                className="px-4 py-2 bg-slate-700 rounded-lg text-white font-bold hover:bg-slate-600 transition-colors"
              >
                -5
              </button>
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg pl-12 pr-4 py-3 text-center text-white font-bold text-xl focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <button 
                onClick={() => setBidAmount(amount => amount + 5)}
                className="px-4 py-2 bg-slate-700 rounded-lg text-white font-bold hover:bg-slate-600 transition-colors"
              >
                +5
              </button>
            </div>

            {/* Quick bid buttons - Auto-place bid */}
            <div className="grid grid-cols-3 gap-2">
              {[10, 25, 50].map(inc => {
                const quickBidAmount = auction.highestBid + inc;
                return (
                  <button
                    key={inc}
                    onClick={() => onPlaceBid(quickBidAmount)}
                    className="py-2 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                  >
                    +{inc}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleBid}
              disabled={bidAmount <= auction.highestBid}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                bidAmount > auction.highestBid
                  ? "bg-linear-to-r from-amber-500 to-orange-500 text-slate-900 hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              {bidAmount > auction.highestBid ? "🔨 Place Bid" : "Bid Too Low"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionModal;
