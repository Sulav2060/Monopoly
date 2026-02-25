import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Dices, AlertCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl w-full"
      >
        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-linear-to-br from-red-500 to-orange-500 p-6 rounded-full">
                <AlertCircle size={64} className="text-white" />
              </div>
            </div>
          </motion.div>

          {/* 404 Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 via-orange-400 to-yellow-400 mb-4">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Page Not Found
            </h2>
            <p className="text-slate-400 text-lg mb-2">
              Oops! Looks like you've landed on a property that doesn't exist.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              The page <span className="font-mono text-slate-400">{location.pathname}</span> could not be found.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate("/")}
              className="group relative px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2 justify-center">
                <Home size={20} />
                Go Home
              </span>
            </button>

            <button
              onClick={() => navigate(-1)}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border-2 border-slate-700 hover:border-slate-600 hover:scale-105 active:scale-95 flex items-center gap-2 justify-center"
            >
              <Dices size={20} />
              Go Back
            </button>
          </motion.div>

          {/* Fun Monopoly Reference */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 pt-8 border-t border-slate-800"
          >
            <p className="text-slate-500 text-sm italic">
              "Do not pass Go. Do not collect $200. Return to Home."
            </p>
          </motion.div>
        </div>
    
      </motion.div>
    </div>
  );
};

export default NotFound;
