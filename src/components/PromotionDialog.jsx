import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pieceOptions = ['q', 'r', 'b', 'n'];

export const PromotionDialog = ({ isOpen, onSelect, isWhite }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full mx-4"
        >
          <h3 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">
            Promote Pawn to:
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {pieceOptions.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(type)}
                className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 dark:from-slate-700 dark:to-slate-600 text-3xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {isWhite ? 
                  type === 'q' ? '♕' : type === 'r' ? '♖' : type === 'b' ? '♗' : '♘'
                  : type === 'q' ? '♛' : type === 'r' ? '♜' : type === 'b' ? '♝' : '♞'
                }
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

