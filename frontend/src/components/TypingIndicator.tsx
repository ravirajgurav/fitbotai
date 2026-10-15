import React from 'react';
import { Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3 py-2 px-1"
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-dark-800 border border-neon-500/30 text-neon-400 shadow-neon-sm">
        <Dumbbell className="w-4 h-4 -rotate-45" />
      </div>

      <div className="bg-dark-850 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 shadow-glass">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium mr-1">
            FitBot is thinking
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neon-400 animate-bounce [animation-delay:-0.3s] shadow-[0_0_8px_#c8f53c]" />
            <span className="w-2 h-2 rounded-full bg-neon-400 animate-bounce [animation-delay:-0.15s] shadow-[0_0_8px_#c8f53c]" />
            <span className="w-2 h-2 rounded-full bg-neon-400 animate-bounce shadow-[0_0_8px_#c8f53c]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
