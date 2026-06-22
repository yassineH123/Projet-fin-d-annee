const { Server } = require('socket.io');

let io;
// Présence : userId -> ensemble des socketIds connectés pour cet utilisateur
const onlineUsers = new Map();

function init(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(`user:${userId}`);
      // Présence : premier socket de cet utilisateur → il passe « en ligne »
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
        io.emit('presence_update', { userId, online: true });
      }
      onlineUsers.get(userId).add(socket.id);
      // Liste des utilisateurs en ligne envoyée au nouveau connecté
      socket.emit('online_users', [...onlineUsers.keys()]);
    }

    socket.on('disconnect', () => {
      if (userId && onlineUsers.has(userId)) {
        const set = onlineUsers.get(userId);
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence_update', { userId, online: false });
        }
      }
    });

    socket.join('feed');
    socket.on('join_conversation',  (id) => socket.join(`conv:${id}`));
    socket.on('leave_conversation', (id) => socket.leave(`conv:${id}`));

    socket.on('typing', ({ conversationId, userId: uid }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', { userId: uid, conversationId });
    });
    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_stop_typing', { conversationId });
    });

    // ── GPS tracking ──
    // Conducteur rejoint la salle de son trajet
    socket.on('driver_join_ride', ({ rideId }) => {
      socket.join(`ride:${rideId}`);
    });

    // Passager s'abonne aux mises à jour de position
    socket.on('passenger_track_ride', ({ rideId }) => {
      socket.join(`ride:${rideId}`);
    });

    // Conducteur envoie sa position → tous les passagers du trajet la reçoivent
    socket.on('driver_location', ({ rideId, lat, lng, speed, heading }) => {
      socket.to(`ride:${rideId}`).emit('location_update', { rideId, lat, lng, speed, heading, ts: Date.now() });
    });

    // Conducteur démarre le trajet
    socket.on('ride_started', ({ rideId }) => {
      io.to(`ride:${rideId}`).emit('ride_status_change', { rideId, status: 'started' });
    });

    // Conducteur termine le trajet
    socket.on('ride_ended', ({ rideId }) => {
      io.to(`ride:${rideId}`).emit('ride_status_change', { rideId, status: 'ended' });
    });
  });
}

function getIO() { return io; }

module.exports = { init, getIO };
