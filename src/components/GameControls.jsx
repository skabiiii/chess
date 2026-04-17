import React from 'react';
import { motion } from 'framer-motion';
import { MoveHistory } from './MoveHistory.jsx';
import { CapturedPieces } from './CapturedPieces.jsx';

export const GameControls = ({
  status,
  onReset,
  onUndo,
  gameMode,
  setGameMode,
  history,
  captured,
  currentMoveIndex,
  isAIMoving
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-80 xl:w-96 flex flex-col items-center gap-6 p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700"
    >
      {/* Status Header */}
      <div className="text-center w-full">
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className={`text-2xl font-bold ${status.turn === 'w' ? 'text-white' : 'text-black'}`}>
            {status.turn === 'w' ? '⚪' : '⚫'}
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-slate-200">
            {status.type === 'playing' ? (status.turn === 'w' ? 'White' : 'Black') : `${status.winner.toUpperCase()} Wins!`}
          </div>
        </div>
        <div className="flex items-center gap-2 justify-center text-lg font-semibold text-slate-600 dark:text-slate-400">
          {isAIMoving && gameMode === 'ai' ? '🤖 AI Thinking...' : status.type === 'playing' ? 'Your Turn' : 'Game Over'}
          {isAIMoving && (
            <motion.div 
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </div>
      </div>

      {/* Game Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setGameMode(gameMode === 'two-player' ? 'ai' : 'two-player')}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
      >
        {gameMode === 'two-player' ? '🤖 Play vs AI' : '👥 Two Players'}
      </motion.button>

      {/* Captured Pieces */}
      <CapturedPieces whiteCaptured={captured.white} blackCaptured={captured.black} />

      {/* Controls */}
      <div className="flex gap-3 w-full">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onUndo}
          disabled={status.type !== 'playing' || history.length === 0}
          className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          ↶ Undo
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm"
        >
          🔄 Reset
        </motion.button>
      </div>

      {/* Move History */}
      <div className="w-full">
        <MoveHistory 
          history={history} 
          currentMoveIndex={currentMoveIndex} 
        />
      </div>
    </motion.div>
  );
};


