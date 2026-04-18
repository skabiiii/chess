import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
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
  const [moveHistory, setMoveHistory] = useState([])
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] })
  const [squareSize, setSquareSize] = useState(64)
  const boardContainerRef = useRef(null)
  const moveListRef = useRef(null)

  const pieceSymbols = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
  }

  const captureSymbols = {
    p: { w: '♙', b: '♟' }, r: { w: '♖', b: '♜' },
    n: { w: '♘', b: '♞' }, b: { w: '♗', b: '♝' }, q: { w: '♕', b: '♛' }
  }

  const themes = {
    light: { bg: 'bg-gray-100', card: 'bg-white', boardBorder: 'border-gray-700', lightSquare: 'bg-amber-100', darkSquare: 'bg-amber-700', text: 'text-gray-900', subtext: 'text-gray-500', divider: 'border-gray-200' },
    dark:  { bg: 'bg-gray-950', card: 'bg-gray-800', boardBorder: 'border-gray-600', lightSquare: 'bg-slate-300', darkSquare: 'bg-slate-600', text: 'text-gray-100', subtext: 'text-gray-400', divider: 'border-gray-700' }
  }

  const t = useMemo(() => isDarkTheme ? themes.dark : themes.light, [isDarkTheme])

  // Dynamically compute square size from container width
  useEffect(() => {
    const el = boardContainerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const size = Math.floor(entry.contentRect.width / 8)
      setSquareSize(size)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Auto-scroll move history
  useEffect(() => {
    if (moveListRef.current)
      moveListRef.current.scrollTop = moveListRef.current.scrollHeight
  }, [moveHistory])

  const resetState = useCallback((newChess) => {
    setBoard(newChess.board())
    setSelectedSquare(null)
    setPossibleMoves([])
    setCaptureMoves([])
    setLastMove(null)
    setShowGameOverModal(false)
    setGameResult(null)
    setMoveHistory([])
    setCapturedPieces({ w: [], b: [] })
  }, [])

  const checkGameOver = useCallback(() => {
    if (!chess.isGameOver()) return
    let result = null
    if (chess.isCheckmate()) result = { type: 'checkmate', winner: chess.turn() === 'w' ? 'Black' : 'White' }
    else if (chess.isStalemate()) result = { type: 'stalemate' }
    else if (chess.isDraw()) result = { type: 'draw' }
    setGameResult(result)
    setTimeout(() => setShowGameOverModal(true), 200)
  }, [chess])

  const handleSquareClick = useCallback((row, col) => {
    const square = `${String.fromCharCode(97 + col)}${8 - row}`

    if (selectedSquare) {
      const legalMoves = chess.moves({ square: selectedSquare, verbose: true })
      const isPromotion = legalMoves.some(m => m.to === square && m.promotion)

      if (isPromotion) {
        setPendingPromotion({ from: selectedSquare, to: square })
        setSelectedSquare(null)
        setPossibleMoves([])
        setCaptureMoves([])
        return
      }

      try {
        setMovingPiece(square)
        const move = chess.move({ from: selectedSquare, to: square })
        setBoard(chess.board())
        setLastMove({ from: selectedSquare, to: square })
        setMoveHistory(prev => [...prev, move])
        if (move.captured)
          setCapturedPieces(prev => ({ ...prev, [move.color]: [...prev[move.color], move.captured] }))
        setTimeout(() => setMovingPiece(null), 180)
        checkGameOver()
      } catch (e) {}
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
  }, [selectedSquare, chess, checkGameOver])

  const handlePromotion = useCallback((piece) => {
    if (!pendingPromotion) return
    const { from, to } = pendingPromotion
    try {
      setMovingPiece(to)
      const move = chess.move({ from, to, promotion: piece })
      setBoard(chess.board())
      setLastMove({ from, to })
      setMoveHistory(prev => [...prev, move])
      if (move.captured)
        setCapturedPieces(prev => ({ ...prev, [move.color]: [...prev[move.color], move.captured] }))
      setTimeout(() => setMovingPiece(null), 180)
      checkGameOver()
    } catch (e) {}
    setPendingPromotion(null)
  }, [pendingPromotion, chess, checkGameOver])

  const renderSquare = useCallback((row, col) => {
    const isLight = (row + col) % 2 === 0
    const square = `${String.fromCharCode(97 + col)}${8 - row}`
    const piece = board[row][col]
    const isSelected = selectedSquare === square
    const isPossibleMove = possibleMoves.includes(square)
    const isCaptureMove = captureMoves.includes(square)
    const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square)
    const fontSize = Math.floor(squareSize * 0.68)

    const squareStyle = {
      width: squareSize,
      height: squareSize,
      ...(isSelected
        ? { backgroundColor: 'rgba(59,130,246,0.45)', boxShadow: 'inset 0 0 0 3px rgba(59,130,246,0.9)', transform: 'scale(1.02)' }
        : isLastMoveSquare
        ? { backgroundColor: 'rgba(234,179,8,0.38)', boxShadow: 'inset 0 0 0 2px rgba(234,179,8,0.8)' }
        : {})
    }

    return (
      <div
        key={square}
        className={`flex items-center justify-center cursor-pointer relative transition-colors duration-150 hover:brightness-110 ${isLight ? t.lightSquare : t.darkSquare}`}
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
                fontSize, lineHeight: 1,
                color: '#ffffff',
                textShadow: '0 0 2px #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                filter: isSelected ? 'drop-shadow(0 0 5px rgba(96,165,250,0.9))' : 'none'
              } : {
                fontSize, lineHeight: 1,
                color: '#1a1a1a',
                textShadow: '0 0 2px #fff, 1px 1px 0 #aaa, -1px -1px 0 #aaa, 1px -1px 0 #aaa, -1px 1px 0 #aaa',
                filter: isSelected ? 'drop-shadow(0 0 5px rgba(96,165,250,0.9))' : 'none'
              }}
            >
              {pieceSymbols[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()]}
            </motion.span>
          )}
        </AnimatePresence>

        {isPossibleMove && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full bg-green-500 opacity-70" style={{ width: squareSize * 0.28, height: squareSize * 0.28 }} />
          </div>
        )}
        {isCaptureMove && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-[3px] rounded-sm" style={{ boxShadow: 'inset 0 0 0 3px rgba(239,68,68,0.85)' }} />
          </div>
        )}
      </div>
    )
  }, [board, selectedSquare, possibleMoves, captureMoves, lastMove, squareSize, t, handleSquareClick])

  const card = `rounded-xl shadow-sm border ${t.card} ${t.divider} p-4`

  return (
    <div className={`min-h-screen flex flex-col ${t.bg} transition-colors duration-300`}>

      {/* Header */}
      <header className={`w-full px-4 py-3 border-b ${t.card} ${t.divider} shadow-sm`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className={`text-lg sm:text-xl font-bold tracking-tight ${t.text}`}>♛ SK's Rival King</h1>
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={`px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors duration-150 ${isDarkTheme ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Dashboard */}
      <main className="flex-1 flex items-start justify-center px-3 sm:px-4 py-4 sm:py-6">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 lg:gap-6 items-start justify-center">

          {/* Left: Status + Board + Controls */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full lg:w-auto min-w-0">

            {/* Status Card */}
            <div className={`w-full ${card}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 ${chess.turn() === 'w' ? 'bg-white border-gray-400' : 'bg-gray-900 border-gray-500'}`} />
                  <span className={`font-semibold text-sm sm:text-base ${t.text}`}>
                    {chess.turn() === 'w' ? 'White' : 'Black'}'s Turn
                  </span>
                </div>
                <div className="flex-shrink-0">
                  {chess.isCheck() && !chess.isGameOver() && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">⚠️ Check</span>
                  )}
                  {chess.isGameOver() && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">🎉 Over</span>
                  )}
                  {!chess.isCheck() && !chess.isGameOver() && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Board — fluid width, max 560px, square via aspect-ratio */}
            <div className={`w-full max-w-[560px] border-4 rounded-xl shadow-xl ${t.boardBorder} p-1.5 sm:p-2 ${t.card}`}>
              <div
                ref={boardContainerRef}
                className="grid grid-cols-8 rounded-lg overflow-hidden w-full"
                style={{ aspectRatio: '1 / 1' }}
              >
                {Array.from({ length: 8 }, (_, row) =>
                  Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
                )}
              </div>
            </div>

            {/* Controls */}
            <div className={`w-full max-w-[560px] ${card} flex gap-3`}>
              <button
                className="flex-1 py-3 sm:py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-150"
                onClick={() => { setSelectedSquare(null); setPossibleMoves([]); setCaptureMoves([]) }}
              >
                Clear Selection
              </button>
              <button
                className="flex-1 py-3 sm:py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-150"
                onClick={() => { chess.reset(); resetState(new Chess()) }}
              >
                New Game
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-64">

            {/* Captured Pieces */}
            <div className={`${card} flex-1 lg:flex-none`}>
              <h2 className={`text-xs font-semibold uppercase tracking-widest mb-3 ${t.subtext}`}>Captured</h2>
              <div className="flex flex-col gap-3">
                {[['w', 'White'], ['b', 'Black']].map(([color, label]) => (
                  <div key={color}>
                    <p className={`text-xs mb-1 ${t.subtext}`}>{label} captured</p>
                    <div className="flex flex-wrap gap-1 min-h-[24px] items-center">
                      {capturedPieces[color].length === 0
                        ? <span className={`text-xs italic ${t.subtext}`}>None</span>
                        : capturedPieces[color].map((p, i) => (
                          <span key={i} className="text-lg sm:text-xl leading-none">
                            {captureSymbols[p]?.[color === 'w' ? 'b' : 'w'] ?? p}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Move History */}
            <div className={`${card} flex-1 lg:flex-none flex flex-col`}>
              <h2 className={`text-xs font-semibold uppercase tracking-widest mb-3 ${t.subtext}`}>Moves</h2>
              <div ref={moveListRef} className="overflow-y-auto max-h-[180px] sm:max-h-[220px] lg:max-h-[400px]">
                {moveHistory.length === 0
                  ? <p className={`text-xs italic ${t.subtext}`}>No moves yet</p>
                  : (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={t.subtext}>
                          <th className="text-left text-xs w-6 pb-2">#</th>
                          <th className="text-left text-xs pb-2">White</th>
                          <th className="text-left text-xs pb-2">Black</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
                          const white = moveHistory[i * 2]
                          const black = moveHistory[i * 2 + 1]
                          return (
                            <tr key={i} className={`${t.text} ${i % 2 === 0 ? (isDarkTheme ? 'bg-gray-700/30' : 'bg-gray-50') : ''}`}>
                              <td className={`py-0.5 px-1 text-xs ${t.subtext}`}>{i + 1}</td>
                              <td className="py-0.5 px-1 font-mono text-xs">{white?.san}</td>
                              <td className="py-0.5 px-1 font-mono text-xs">{black?.san ?? ''}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )
                }
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Promotion Modal */}
      <AnimatePresence>
        {pendingPromotion && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className={`rounded-xl p-6 shadow-2xl w-full max-w-xs ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <p className="text-center font-semibold text-lg mb-4">Promote Pawn</p>
              <div className="flex justify-center gap-3">
                {[['q', '♛', '♕'], ['r', '♜', '♖'], ['b', '♝', '♗'], ['n', '♞', '♘']].map(([piece, black, white]) => (
                  <button
                    key={piece}
                    onClick={() => handlePromotion(piece)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 text-3xl sm:text-4xl rounded-lg flex items-center justify-center transition-all duration-150 active:scale-95 ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-sm ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="text-center">
                <div className="text-5xl sm:text-6xl mb-4">{gameResult?.type === 'checkmate' ? '🎉' : '🤝'}</div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {gameResult?.type === 'checkmate' && <span className={gameResult.winner === 'White' ? 'text-blue-500' : 'text-red-500'}>{gameResult.winner} Wins!</span>}
                  {gameResult?.type === 'stalemate' && <span className="text-yellow-500">Stalemate!</span>}
                  {gameResult?.type === 'draw' && <span className="text-gray-500">It's a Draw!</span>}
                </h2>
                <p className={`mb-6 text-sm ${t.subtext}`}>
                  {gameResult?.type === 'checkmate' && 'Checkmate! Well played.'}
                  {gameResult?.type === 'stalemate' && 'No legal moves available.'}
                  {gameResult?.type === 'draw' && 'The game ended in a draw.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { chess.reset(); resetState(new Chess()) }}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-150"
                  >
                    🎮 Play Again
                  </button>
                  <button
                    onClick={() => setShowGameOverModal(false)}
                    className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white rounded-lg font-semibold transition-colors duration-150"
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
