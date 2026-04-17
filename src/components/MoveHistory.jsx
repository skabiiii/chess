import React, { useState } from 'react';
import { motion } from 'framer-motion';

const pieceSymbols = {
  'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔',
  'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚'
};

export const MoveHistory = ({ history, onGoToMove, currentMoveIndex }) => {
  const [expanded, setExpanded] = useState(false);

  const moves = [];
  for (let i = 0; i < history.length; i += 2) {
    const whiteMove = history[i]?.move?.san || '';
    const blackMove = history[i + 1]?.move?.san || '';
    moves.push(`#${Math.floor(i/2 + 1)} ${whiteMove} ${blackMove}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="w-full max-h-96 overflow-y-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">Move History</h4>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
        >
          {expanded ? '−' : '+'}
        </button>
      </div>
      <div className={expanded ? 'block space-y-2' : 'hidden'}>
        {moves.map((move, index) => (
          <motion.button
            key={index}
            whileHover={{ backgroundColor: '#f3f4f6' }}
            className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all text-slate-700 dark:text-slate-300 ${
              index <= currentMoveIndex ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onClick={() => onGoToMove(index * 2)} // Go to start of pair
          >
            {move}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

