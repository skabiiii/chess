const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Chess } = require('chess.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const games = new Map(); // roomId -> game state

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    if (!games.has(roomId)) {
      games.set(roomId, {
        chess: new Chess(),
        players: { white: null, black: null },
        spectators: [],
        history: [],
        status: { type: 'waiting', turn: 'w' }
      });
    }

    const game = games.get(roomId);

    // Assign player color
    if (!game.players.white) {
      game.players.white = socket.id;
      socket.emit('player-assigned', 'white');
      socket.emit('game-state', getGameState(game));
    } else if (!game.players.black) {
      game.players.black = socket.id;
      socket.emit('player-assigned', 'black');
      socket.emit('game-state', getGameState(game));
      // Start the game when both players are present
      game.status = { type: 'playing', turn: 'w' };
      io.to(roomId).emit('game-state', getGameState(game));
    } else {
      game.spectators.push(socket.id);
      socket.emit('spectator-joined');
      socket.emit('game-state', getGameState(game));
    }

    console.log(`Player joined room ${roomId}:`, game.players);
  });

  socket.on('make-move', (data) => {
    const { roomId, move } = data;
    const game = games.get(roomId);

    if (!game) return;

    const playerColor = game.players.white === socket.id ? 'w' : 'b';
    if (game.status.turn !== playerColor || game.status.type !== 'playing') return;

    try {
      const prevFen = game.chess.fen();
      game.chess.move(move);
      game.history.push({ move, fen: prevFen });

      if (game.chess.isGameOver()) {
        game.status = {
          type: 'gameOver',
          winner: game.chess.turn() === 'w' ? 'black' : 'white'
        };
      } else {
        game.status = { type: 'playing', turn: game.chess.turn() };
      }

      io.to(roomId).emit('game-state', getGameState(game));
    } catch (error) {
      socket.emit('invalid-move', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove player from all games
    for (const [roomId, game] of games) {
      if (game.players.white === socket.id) {
        game.players.white = null;
        game.status = { type: 'waiting', turn: 'w' };
        io.to(roomId).emit('player-disconnected', 'white');
      } else if (game.players.black === socket.id) {
        game.players.black = null;
        game.status = { type: 'waiting', turn: 'w' };
        io.to(roomId).emit('player-disconnected', 'black');
      } else {
        game.spectators = game.spectators.filter(id => id !== socket.id);
      }

      io.to(roomId).emit('game-state', getGameState(game));
    }
  });
});

function getGameState(game) {
  return {
    board: game.chess.board(),
    history: game.history,
    status: game.status,
    players: {
      white: game.players.white ? true : false,
      black: game.players.black ? true : false
    },
    isCheck: game.chess.isCheck(),
    fen: game.chess.fen()
  };
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});