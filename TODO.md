# Chess Game Enhancement TODO

## Planned Steps (Approved)

1. ✅ Create TODO.md (current)

2. ✅ Create new components:
   - src/components/PromotionDialog.jsx
   - src/components/MoveHistory.jsx
   - src/components/CapturedPieces.jsx

3. ✅ Update src/hooks/useChess.js:
   - Added gameMode state
   - Implemented minimax AI (depth 3 with randomness)
   - Promotion handling with pending state
   - Captured pieces tracking
   - isCheck detection
   - Auto AI moves after player turn
   - Exposed new props (onPromotionSelect, setGameMode, etc.)

4. 🔄 Refactor src/components/Chessboard.jsx
   - Add gameMode state ('two-player' | 'ai')
   - Implement simple minimax AI (depth 3, random if tie)
   - Handle promotion: detect pawn promotion moves, pause for selection
   - Compute/expose captured pieces for white/black
   - Add isCheck state
   - Auto AI move after player turn in AI mode

4. Refactor src/components/Chessboard.jsx:
   - Use Square.jsx for all squares
   - Add Framer Motion AnimatePresence for piece transitions
   - Board shake/glow on check
   - Promotion overlay/dialog integration

5. Update src/components/GameControls.jsx:
   - Add game mode toggle button
   - Integrate MoveHistory and CapturedPieces
   - Promotion buttons (passed from parent)

6. Update src/App.jsx:
   - Manage gameMode state
   - Pass to useChess and children
   - Enhanced status display

7. Add animations & polish:
   - Piece move animations
   - Capture effects
   - Check alerts

8. Test & followup:
   - Check deps: framer-motion, chess.js
   - Manual testing: two-player, AI, promotion, checkmate, etc.
   - `npm run dev`

## Progress
- [ ] Step 2
- [ ] Step 3
- [ ] ...
