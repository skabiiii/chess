import { motion } from 'framer-motion'

const pieceUnicode = {
  'wP': '♙', 'wR': '♖', 'wN': '♘', 'wB': '♗', 'wQ': '♕', 'wK': '♔',
  'bP': '♟', 'bR': '♜', 'bN': '♞', 'bB': '♝', 'bQ': '♛', 'bK': '♚'
}

const Square = ({ piece, square, isSelected, isLegal, isLastMove, onClick, row, col }) => {
  const squareColor = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863'
  const pieceSymbol = piece ? pieceUnicode[`${piece.color}${piece.type}`] : ''
  
  let style = {
    backgroundColor: squareColor,
    width: '72px',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '44px',
    fontWeight: 'bold',
    cursor: 'pointer',
    position: 'relative',
    borderRadius: '6px',
    boxShadow: isSelected || isLegal || isLastMove ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
  }

  if (isSelected) {
    style.backgroundColor = '#10b981'
    style.boxShadow = '0 0 0 4px rgba(16,185,129,0.5), 0 8px 24px rgba(16,185,129,0.4)'
  } else if (isLegal) {
    style.backgroundColor = '#f59e0b'
    style.boxShadow = '0 0 0 2px rgba(245,158,11,0.5), 0 4px 12px rgba(245,158,11,0.3)'
  } else if (isLastMove) {
    style.backgroundColor = '#3b82f6'
    style.boxShadow = '0 0 0 4px rgba(59,130,246,0.6), 0 8px 24px rgba(59,130,246,0.4)'
  }

  return (
    <motion.div
      style={style}
      onClick={() => onClick(square)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      title={square}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {pieceSymbol}
    </motion.div>
  )
}

export default Square

