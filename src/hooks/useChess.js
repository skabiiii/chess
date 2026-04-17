import { useState, useCallback, useEffect } from 'react'
import { Chess } from 'chess.js'

export const useChess = () => {
  const [chess, setChess] = useState(new Chess())
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [legalMoves, setLegalMoves] = useState([])
  const [status, setStatus] = useState({ type: 'playing', turn: 'w' })
  const [lastMove, setLastMove] = useState(null)
  const [gameMode, setGameMode] = useState('two-player')
  const [promotionPending, setPromotionPending] = useState(null)
  const [captured, setCaptured] = useState({ white: [], black: [] })
  const [isCheck, setIsCheck] = useState(false)
  const [isAIMoving, setIsAIMoving] = useState(false)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)

// Piece values for evaluation
  const pieceValue = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 }

  const evaluateBoard = (board) => {
    let score = 0
    for (let row of board) {
      for (let square of row) {
        if (square) {
          const value = pieceValue[square.type]
          score += (square.color === 'w' ? value : -value)
        }
      }
    }
    return score
  }

  const minimax = (depth, game, maximizingPlayer, alpha = -Infinity, beta = Infinity) => {
    if (depth === 0 || game.isGameOver()) {
      return evaluateBoard(game.board())
    }

    const moves = game.moves({ verbose: true })

    if (maximizingPlayer) {
      let maxEval = -Infinity
      for (let move of moves) {
        game.move(move)
        const evalScore = minimax(depth - 1, game, false, alpha, beta)
        game.undo()
        maxEval = Math.max(maxEval, evalScore)
        alpha = Math.max(alpha, evalScore)
        if (beta <= alpha) break
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (let move of moves) {
        game.move(move)
        const evalScore = minimax(depth - 1, game, true, alpha, beta)
        game.undo()
        minEval = Math.min(minEval, evalScore)
        beta = Math.min(beta, evalScore)
        if (beta <= alpha) break
      }
      return minEval
    }
  }

  const makeAIMove = useCallback(async () => {
    if (isAIMoving) return
    setIsAIMoving(true)

    const possibleMoves = chess.moves({ verbose: true })
    let bestMove = null
    let bestValue = -Infinity
    let bestMoves = []
    const depth = 3

    for (let move of possibleMoves) {
      const tempGame = new Chess(chess.fen())
      tempGame.move(move)
      const value = minimax(depth - 1, tempGame, false)

      const boardValue = -value

      if (boardValue > bestValue) {
        bestValue = boardValue
        bestMoves = [move]
      } else if (boardValue === bestValue) {
        bestMoves.push(move)
      }
    }

    const aiMove = bestMoves[Math.floor(Math.random() * bestMoves.length)]

    if (aiMove) {
      const prevFen = chess.fen()
      chess.move(aiMove)
      setHistory([...history, { move: aiMove, fen: prevFen }])
      setChess(new Chess(chess.fen()))
      setLastMove(aiMove)
      setSelected(null)
      setLegalMoves([])
      setCurrentMoveIndex(history.length)
    }

    const gameOver = chess.isGameOver()
    if (gameOver) {
      setStatus({ type: 'gameOver', winner: chess.turn() === 'w' ? 'black' : 'white' })
    } else {
      setStatus({ type: 'playing', turn: chess.turn() })
    }
    setIsCheck(chess.isCheck())

    setIsAIMoving(false)
  }, [chess, history, isAIMoving, status.type, minimax])

  const [chess, setChess] = useState(new Chess())
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [legalMoves, setLegalMoves] = useState([])
  const [status, setStatus] = useState({ type: 'playing', turn: 'w' })
  const [lastMove, setLastMove] = useState(null)
  const [gameMode, setGameMode] = useState('two-player')
  const [promotionPending, setPromotionPending] = useState(null)
  const [captured, setCaptured] = useState({ white: [], black: [] })
  const [isCheck, setIsCheck] = useState(false)
  const [isAIMoving, setIsAIMoving] = useState(false)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)

  const getLegalMoves = useCallback((square) => {
    const moves = chess.moves({ square, verbose: true })
    return moves ? moves.map(m => m.to) : []
  }, [chess])

  const onPromotionSelect = useCallback((promotion) => {
    if (!promotionPending) return

    const { from, to } = promotionPending
    const prevFen = chess.fen()
    chess.move({ from, to, promotion })
    setHistory([...history, { move: { from, to, promotion }, fen: prevFen }])
    setChess(new Chess(chess.fen()))
    setLastMove({ from, to })
    setSelected(null)
    setLegalMoves([])
    setPromotionPending(null)
    setCurrentMoveIndex(history.length)
    setIsCheck(chess.isCheck())

    // Trigger AI if needed
    if (gameMode === 'ai' && chess.turn() === 'b' && status.type === 'playing') {
      setTimeout(() => makeAIMove(), 250)
    }
  }, [promotionPending, chess, history, gameMode, status.type, makeAIMove])

  const selectSquare = useCallback((square) => {
    if (status.type !== 'playing' || isAIMoving || promotionPending) return

    const piece = chess.get(square)
    if (piece && piece.color === chess.turn()) {
      setSelected(square)
      setLegalMoves(getLegalMoves(square))
    } else if (selected && legalMoves.includes(square)) {
      const potentialMoves = chess.moves({ square: selected, verbose: true })
      const isPromotionMove = potentialMoves.some(m => m.to === square && m.flags.includes('p'))

      if (isPromotionMove) {
        setPromotionPending({ from: selected, to: square })
        return
      }

      const moveObj = potentialMoves.find(m => m.to === square)
      const move = moveObj ? moveObj : { from: selected, to: square }
      const prevFen = chess.fen()
      chess.move(move)
      setHistory([...history, { move, fen: prevFen }])
      setChess(new Chess(chess.fen()))
      setLastMove(move)
      setSelected(null)
      setLegalMoves([])

      // Update captured if capture
      if (move.captured) {
        const capturedPiece = { type: move.captured, color: chess.turn() === 'w' ? 'b' : 'w' }
        setCaptured(prev => ({
          ...prev,
          [chess.turn() === 'w' ? 'black' : 'white']: [...prev[chess.turn() === 'w' ? 'black' : 'white'], capturedPiece]
        }))
      }
    } else {
      setSelected(null)
      setLegalMoves([])
    }

    const gameOver = chess.isGameOver()
    if (gameOver) {
      setStatus({ type: 'gameOver', winner: chess.turn() === 'w' ? 'black' : 'white' })
    } else {
      setStatus({ type: 'playing', turn: chess.turn() })
    }
    setIsCheck(chess.isCheck())

    // AI move if two player no, ai yes black turn
    if (gameMode === 'ai' && chess.turn() === 'b' && !promotionPending) {
      setTimeout(() => makeAIMove(), 500)
    }
  }, [chess, selected, legalMoves, status.type, getLegalMoves, history, gameMode, promotionPending, isAIMoving, makeAIMove])

  const undo = useCallback(() => {
    if (history.length === 0 || status.type !== 'playing') return
    const last = history[history.length - 1]
    const newHistory = history.slice(0, -1)
    const newChess = new Chess(last.fen)
    setChess(newChess)
    setHistory(newHistory)
    setSelected(null)
    setLegalMoves([])
    setLastMove(null)
    setPromotionPending(null)
    setIsCheck(newChess.isCheck())
    setStatus({ type: 'playing', turn: newChess.turn() })
  }, [history, status.type])

  const reset = useCallback(() => {
    setChess(new Chess())
    setHistory([])
    setSelected(null)
    setLegalMoves([])
    setStatus({ type: 'playing', turn: 'w' })
    setLastMove(null)
    setPromotionPending(null)
    setCaptured({ white: [], black: [] })
    setIsCheck(false)
    setIsAIMoving(false)
    setCurrentMoveIndex(0)
  }, [])

  useEffect(() => {
    setIsCheck(chess.isCheck())
  }, [chess])

  const reset = useCallback(() => {
    setChess(new Chess())
    setHistory([])
    setSelected(null)
    setLegalMoves([])
    setStatus({ type: 'playing', turn: 'w' })
    setLastMove(null)
    setPromotionPending(null)
    setCaptured({ white: [], black: [] })
    setIsCheck(false)
    setIsAIMoving(false)
    setCurrentMoveIndex(0)
    setGameMode('two-player')
  }, [])

  return {
    chess,
    board: chess.board(),
    selected,
    legalMoves,
    status,
    lastMove,
    history,
    gameMode,
    promotionPending,
    captured,
    isCheck,
    isAIMoving,
    currentMoveIndex,
    selectSquare,
    onPromotionSelect,
    makeAIMove,
    setGameMode,
    undo,
    reset
  }
}

