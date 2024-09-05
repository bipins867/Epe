const io = require("socket.io")(process.env.SOCKET_PORT, {
    cors: {
      origin: "*",
    },
  });
  const socketUsers = new Map();
  
  
  function sendMessage2Case(caseId, message) {
      // Broadcast the message to the specific room
      io.to(caseId).emit('case-message', message);
  }
  function sendCaseInfo(info) {
      // Broadcast the case info to all connected clients
      io.emit('case-info', info);
  }
  
  
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
  
    // Handle user joining a specific case room
    socket.on("join-case", (caseId) => {
      socket.join(caseId);
      socketUsers.set(socket.id, caseId);
      console.log(`User ${socket.id} joined room: ${caseId}`);
    });
  
    // Handle user leaving a specific case room
    socket.on("leave-case", () => {
      const caseId = socketUsers.get(socket.id);
      if (caseId) {
        socket.leave(caseId);
        socketUsers.delete(socket.id);
        console.log(`User ${socket.id} left room: ${caseId}`);
      }
    });
  
    // Handle admin broadcasting info to a specific room
    socket.on('case-info', (info) => {
      sendCaseInfo(info); // Broadcast case info to all connected clients
  });
  
    // Handle disconnection
    socket.on("disconnect", () => {
      const caseId = socketUsers.get(socket.id);
      if (caseId) {
        socketUsers.delete(socket.id);
        console.log(`User ${socket.id} disconnected from room: ${caseId}`);
      } else {
        console.log(`User disconnected: ${socket.id}`);
      }
    });
  });
  
  exports.io = io;
  exports.socketUsers=socketUsers;
  exports.sendCaseInfo=sendCaseInfo;
  exports.sendMessage2Case=sendMessage2Case;