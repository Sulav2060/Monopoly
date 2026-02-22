import React, { useEffect, useState, useRef } from "react";

const AuctionModal = ({ auction, currentPlayerId, onPlaceBid, onTimeout }) => {
  const [bidAmount, setBidAmount] = useState(auction.highestBid + 7);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);

  // Reset timer and bid input when highest bid changes
  useEffect(() => {
    setTimeLeft(5);
    setBidAmount(Math.max(bidAmount, auction.highestBid + 3));
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl text-center relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent animate-pulse" />

        <h2 className="text-3xl text-amber-500 font-bold mb-2">🔨 Auction!</h2>
        <h3 className="text-xl text-white font-semibold mb-6">
          {auction.property.name}
        </h3>

        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Current Highest Bid</div>
          <div className="text-3xl font-mono font-bold text-emerald-400">
            Rs. {auction.highestBid}
          </div>
          {auction.highestBidderId && (
            <div className="text-xs text-slate-500 mt-1">
              held by {auction.highestBidderId === currentPlayerId ? "You" : "Player " + auction.highestBidderId.slice(0, 4)}
            </div>
          )}
        </div>

        <div className="mb-6">
            <div className="text-slate-200 mb-2 font-medium">Time Remaining</div>
            <div className={`text-4xl font-bold transition-colors ${timeLeft <= 3 ? "text-red-500 scale-110" : "text-white"}`}>
                {timeLeft}s
            </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button 
                onClick={() => setBidAmount(amount => Math.max(auction.highestBid + 1, amount - 10))}
                className="px-3 bg-slate-700 rounded-lg text-white font-bold hover:bg-slate-600"
            >-</button>
            <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-center text-white font-bold text-lg focus:outline-none focus:border-amber-500"
            />
            <button 
                onClick={() => setBidAmount(amount => amount + 10)}
                className="px-3 bg-slate-700 rounded-lg text-white font-bold hover:bg-slate-600"
            >+</button>
          </div>

          <button
            onClick={handleBid}
            disabled={bidAmount <= auction.highestBid}
            className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                bidAmount > auction.highestBid
                ? "bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            Place Bid
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionModal;
