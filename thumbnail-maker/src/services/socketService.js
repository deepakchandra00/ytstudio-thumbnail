const { Server } = require('socket.io');

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Method to emit events to all connected clients
  emit(event, data) {
    this.io.emit(event, data);
  }

  // Method to emit events to a specific room
  emitToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }
}

module.exports = SocketService; 