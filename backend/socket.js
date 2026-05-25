const { Server } = require('socket.io');

let io;

function init(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) socket.join(`user:${userId}`);

    socket.on('join_conversation',  (id) => socket.join(`conv:${id}`));
    socket.on('leave_conversation', (id) => socket.leave(`conv:${id}`));

    socket.on('typing', ({ conversationId, userId: uid }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', { userId: uid, conversationId });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_stop_typing', { conversationId });
    });
  });
}

function getIO() { return io; }

module.exports = { init, getIO };
