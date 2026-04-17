import React, { useState, useCallback, useMemo } from 'react'
import { Chess } from 'chess.js'
import { motion, AnimatePresence } from 'framer-motion'

const Chessboard = () => {
  const [chess] = useState(new Chess())
  const [board, setBoard] = useState(chess.board())
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [possibleMoves, setPossibleMoves] = useState([])
  const [captureMoves, setCaptureMoves] = useState([])
  const [lastMove, setLastMove] = useState(null)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [movingPiece, setMovingPiece] = useState(null)
  const [pendingPromotion, setPendingPromotion] = useState(null)

  const pieceSymbols = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
  }

  const themes = {
    light: {
      bg: 'bg-gray-50',
      boardBorder: 'border-gray-800',
      lightSquare: 'bg-amber-100',
      darkSquare: 'bg-amber-700',
      text: 'text-gray-900'
    },
    dark: {
      bg: 'bg-gray-900',
      boardBorder: 'border-gray-300',
      lightSquare: 'bg-slate-300',
      darkSquare: 'bg-slate-700',
      text: 'text-gray-100'
    }
  }

  const currentTheme = useMemo(() => isDarkTheme ? themes.dark : themes.light, [isDarkTheme])

  const handleSquareClick = useCallback((row, col) => {
    const square = `${String.fromCharCode(97 + col)}${8 - row}`
    
    if (selectedSquare) {
      // Check if this move is a promotion
      const legalMoves = chess.moves({ square: selectedSquare, verbose: true })
      const isPromotion = legalMoves.some(m => m.to === square && m.promotion)

      if (isPromotion) {
        // Pause and show promotion UI
        setPendingPromotion({ from: selectedSquare, to: square })
        setSelectedSquare(null)
        setPossibleMoves([])
        setCaptureMoves([])
        return
      }

      try {
        setMovingPiece(square)
        chess.move({ from: selectedSquare, to: square })
        setBoard(chess.board())
        setLastMove({ from: selectedSquare, to: square })
        setTimeout(() => setMovingPiece(null), 180)
        
        if (chess.isGameOver()) {
          let result = null
          if (chess.isCheckmate()) {
            result = { type: 'checkmate', winner: chess.turn() === 'w' ? 'Black' : 'White' }
          } else if (chess.isStalemate()) {
            result = { type: 'stalemate' }
          } else if (chess.isDraw()) {
            result = { type: 'draw' }
          }
          setGameResult(result)
          setTimeout(() => setShowGameOverModal(true), 200)
        }
      } catch (error) {
        // Invalid move, ignore
      }
      setSelectedSquare(null)
      setPossibleMoves([])
      setCaptureMoves([])
    } else {
      const piece = chess.get(square)
      if (piece) {
        setSelectedSquare(square)
        const moves = chess.moves({ square, verbose: true })
        setPossibleMoves(moves.filter(m => !m.captured).map(m => m.to))
        setCaptureMoves(moves.filter(m => m.captured).map(m => m.to))
      }
    }
  }, [selectedSquare, possibleMoves, chess, showGameOverModal, gameResult])

  const handlePromotion = useCallback((piece) => {
    if (!pendingPromotion) return
    const { from, to } = pendingPromotion
    try {
      setMovingPiece(to)
      chess.move({ from, to, promotion: piece })
      setBoard(chess.board())
      setLastMove({ from, to })
      setTimeout(() => setMovingPiece(null), 180)

      if (chess.isGameOver()) {
        let result = null
        if (chess.isCheckmate()) {
          result = { type: 'checkmate', winner: chess.turn() === 'w' ? 'Black' : 'White' }
        } else if (chess.isStalemate()) {
          result = { type: 'stalemate' }
        } else if (chess.isDraw()) {
          result = { type: 'draw' }
        }
        setGameResult(result)
        setTimeout(() => setShowGameOverModal(true), 200)
      }
    } catch (error) {
      // ignore
    }
    setPendingPromotion(null)
  }, [pendingPromotion, chess])

  const renderSquare = useCallback((row, col) => {
    const isLight = (row + col) % 2 === 0
    const square = `${String.fromCharCode(97 + col)}${8 - row}`
    const piece = board[row][col]
    const isSelected = selectedSquare === square
    const isPossibleMove = possibleMoves.includes(square)
    const isCaptureMove = captureMoves.includes(square)
    const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square)
    
    const squareStyle = (() => {
      if (isSelected) return {
        backgroundColor: 'rgba(59,130,246,0.45)',
        boxShadow: 'inset 0 0 0 3px rgba(59,130,246,0.9)',
        transform: 'scale(1.02)'
      }
      if (isLastMoveSquare) return {
        backgroundColor: 'rgba(234,179,8,0.38)',
        boxShadow: 'inset 0 0 0 2px rgba(234,179,8,0.8)'
      }
      return {}
    })()

    return (
      <div
        key={square}
        className={`w-16 h-16 flex items-center justify-center text-4xl cursor-pointer relative transition-colors duration-150 ease-out hover:brightness-110 ${
          isLight ? currentTheme.lightSquare : currentTheme.darkSquare
        }`}
        onClick={() => handleSquareClick(row, col)}
        style={squareStyle}
      >
        <AnimatePresence mode="wait">
          {piece && (
            <motion.span
              key={`${square}-${piece.type}-${piece.color}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={piece.color === 'w' ? {
                color: '#ffffff',
                fontSize: '2.6rem',
                textShadow: '0 0 2px #000, 0 0 3px #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                filter: isSelected ? 'drop-shadow(0 0 6px rgba(96,165,250,0.9))' : 'none'
              } : {
                color: '#1a1a1a',
                fontSize: '2.6rem',
                textShadow: '0 0 2px #fff, 0 0 3px #ccc, 1px 1px 0 #aaa, -1px -1px 0 #aaa, 1px -1px 0 #aaa, -1px 1px 0 #aaa',
                filter: isSelected ? 'drop-shadow(0 0 6px rgba(96,165,250,0.9))' : 'none'
              }}
            >
              {pieceSymbols[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()]}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Normal move: small green dot */}
        {isPossibleMove && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-green-500 opacity-70" />
          </div>
        )}

        {/* Capture move: red corner brackets */}
        {isCaptureMove && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-[3px] rounded-sm"
              style={{ boxShadow: 'inset 0 0 0 3px rgba(239,68,68,0.85)' }}
            />
          </div>
        )}

      </div>
    )
  }, [board, selectedSquare, possibleMoves, captureMoves, lastMove, movingPiece, currentTheme, pieceSymbols, handleSquareClick])

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${currentTheme.bg}`}>
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className={`text-3xl sm:text-4xl font-bold ${currentTheme.text}`}>
            SK's Rival King
          </h1>
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
              isDarkTheme 
                ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {isDarkTheme ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Game Status */}
          <div className={`text-center mb-6 ${currentTheme.text}`}>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg min-h-[120px] flex flex-col justify-center">
              <p className="text-lg sm:text-xl font-medium mb-2">
                Current Turn: <span className="font-bold text-blue-500">{chess.turn() === 'w' ? 'White' : 'Black'}</span>
              </p>
              <div className="h-8 flex items-center justify-center">
                {chess.isCheck() && (
                  <p className="text-red-500 font-bold text-lg">⚠️ Check!</p>
                )}
                {chess.isGameOver() && (
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-green-500 mb-1">
                      🎉 Game Over!
                    </p>
                    <p className="text-lg font-semibold">
                      {chess.isCheckmate() ? `${chess.turn() === 'w' ? 'Black' : 'White'} Wins!` : "It's a Draw!"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chess Board Container */}
          <div className="flex justify-center">
            <div className={`inline-block border-4 rounded-xl shadow-2xl ${currentTheme.boardBorder} bg-gradient-to-br from-white/20 to-black/20 p-2 transition-shadow duration-300 hover:shadow-3xl w-[544px] h-[544px]`}>
              <div className="grid grid-cols-8 gap-0 rounded-lg overflow-hidden shadow-inner w-[528px] h-[528px]">
                {Array.from({ length: 8 }, (_, row) =>
                  Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
                )}
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex justify-center mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg min-h-[72px] flex items-center">
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  onClick={() => {
                    setSelectedSquare(null)
                    setPossibleMoves([])
                  }}
                >
                  Clear Selection
                </button>
                <button 
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  onClick={() => {
                    const newChess = new Chess()
                    setBoard(newChess.board())
                    setSelectedSquare(null)
                    setPossibleMoves([])
                    setLastMove(null)
                    setShowGameOverModal(false)
                    setGameResult(null)
                    chess.reset()
                  }}
                >
                  New Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-4 text-center ${currentTheme.text} opacity-70`}>
        <p className="text-sm">Click a piece to see possible moves • SK's Rival King Experience</p>
      </footer>

      {/* Promotion Modal */}
      <AnimatePresence>
        {pendingPromotion && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className={`rounded-xl p-6 shadow-2xl ${ isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <p className="text-center font-semibold text-lg mb-4">Promote Pawn</p>
              <div className="flex gap-3">
                {[['q', '♛', '♕'], ['r', '♜', '♖'], ['b', '♝', '♗'], ['n', '♞', '♘']].map(([piece, black, white]) => (
                  <button
                    key={piece}
                    onClick={() => handlePromotion(piece)}
                    className={`w-16 h-16 text-4xl rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-105 ${
                      isDarkTheme
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {chess.turn() === 'w' ? white : black}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {showGameOverModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="text-center">
                {/* Celebration Icon */}
                <div className="text-6xl mb-4">
                  {gameResult?.type === 'checkmate' ? '🎉' : '🤝'}
                </div>
                
                {/* Game Result Title */}
                <h2 className="text-3xl font-bold mb-4">
                  {gameResult?.type === 'checkmate' && (
                    <span className={gameResult.winner === 'White' ? 'text-blue-600' : 'text-red-600'}>
                      {gameResult.winner} Wins!
                    </span>
                  )}
                  {gameResult?.type === 'stalemate' && (
                    <span className="text-yellow-600">Stalemate!</span>
                  )}
                  {gameResult?.type === 'draw' && (
                    <span className="text-gray-600">It's a Draw!</span>
                  )}
                </h2>
                
                {/* Game Result Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {gameResult?.type === 'checkmate' && 'Checkmate! The king is captured.'}
                  {gameResult?.type === 'stalemate' && 'No legal moves available.'}
                  {gameResult?.type === 'draw' && 'The game ended in a draw.'}
                </p>
                
                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      const newChess = new Chess()
                      setBoard(newChess.board())
                      setSelectedSquare(null)
                      setPossibleMoves([])
                      setLastMove(null)
                      setShowGameOverModal(false)
                      setGameResult(null)
                      chess.reset()
                    }}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    🎮 Play Again
                  </button>
                  <button
                    onClick={() => setShowGameOverModal(false)}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    👁️ View Board
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Chessboard