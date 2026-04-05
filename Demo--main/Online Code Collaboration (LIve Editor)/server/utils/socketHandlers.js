const Project = require('../models/Project');

// Socket.io event handlers for real-time collaboration
const socketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`✓ User connected: ${socket.id}`);

    // User joins a room
    socket.on('join-room', async (data) => {
      const { roomId, userId, username } = data;

      socket.join(roomId);

      try {
        // Update project with active user
        await Project.findOneAndUpdate(
          { roomId },
          {
            $push: {
              activeUsers: {
                userId,
                username,
                socketId: socket.id,
              },
            },
          },
          { new: true }
        );

        // Notify others in room
        socket.to(roomId).emit('user-joined', { username, userId });
        socket.emit('room-joined', { message: `Successfully joined ${roomId}` });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Code update - broadcast to all in room
    socket.on('code-change', async (data) => {
      const { roomId, code, userId } = data;

      try {
        // Update code in database
        await Project.findOneAndUpdate({ roomId }, { code, updatedAt: new Date() });

        // Broadcast to all in room except sender
        socket.to(roomId).emit('code-updated', { code, userId });
      } catch (error) {
        console.error('Error updating code:', error);
      }
    });

    // Cursor movement
    socket.on('cursor-move', (data) => {
      const { roomId, userId, position } = data;
      socket.to(roomId).emit('cursor-updated', { userId, position });
    });

    // Language change
    socket.on('language-change', async (data) => {
      const { roomId, language } = data;

      try {
        await Project.findOneAndUpdate({ roomId }, { language });
        socket.to(roomId).emit('language-changed', { language });
      } catch (error) {
        console.error('Error changing language:', error);
      }
    });

    // User leaves room
    socket.on('leave-room', async (data) => {
      const { roomId, userId } = data;

      try {
        await Project.findOneAndUpdate(
          { roomId },
          {
            $pull: {
              activeUsers: { userId },
            },
          }
        );

        socket.to(roomId).emit('user-left', { userId });
      } catch (error) {
        console.error('Error leaving room:', error);
      }

      socket.leave(roomId);
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`✗ User disconnected: ${socket.id}`);

      // Find and update all rooms this user was in
      try {
        await Project.updateMany(
          { 'activeUsers.socketId': socket.id },
          {
            $pull: {
              activeUsers: { socketId: socket.id },
            },
          }
        );
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = { socketHandlers };
