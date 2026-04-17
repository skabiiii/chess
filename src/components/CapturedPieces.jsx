import React from 'react';
import { motion } from 'framer-motion';

const pieceSymbols = {
  w: { P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔' },
  b: { P: '♟', R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚' }
};

export const CapturedPieces = ({ whiteCaptured = [], blackCaptured = [] }) => {
  return (
    <div className="space-y-4">
      <div>
        <h5 className="font-bold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-3 text-center">Black Captured</h5>
        <div className="flex flex-wrap gap-2 justify-center">
          {whiteCaptured.map((piece, i) => (
            <motion.div
              key={`${piece.color}-${piece.type}-${i}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center text-lg font-bold shadow-md"
              style={{ color: piece.color === 'w' ? '#dc2626' : '#b91c1c' }}
            >
              {pieceSymbols[piece.color][piece.type.toUpperCase()]}
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <h5 className="font-bold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-3 text-center">White Captured</h5>
        <div className="flex flex-wrap gap-2 justify-center">
          {blackCaptured.map((piece, i) => (
            <motion.div
              key={`${piece.color}-${piece.type}-${i}`}
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-lg font-bold shadow-md"
              style={{ color: piece.color === 'b' ? '#2563eb' : '#1d4ed8' }}
            >
              {pieceSymbols[piece.color][piece.type.toUpperCase()]}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

