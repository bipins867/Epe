const fs = require('fs');
const https = require('https');
const socketIO = require('socket.io');

// Load SSL certificate and key
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/epeindia.in/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/epeindia.in/fullchain.pem')
};

// Create an HTTPS server
const httpsServer = https.createServer(options);

// Attach Socket.IO to the HTTPS server
const io = socketIO(httpsServer, {
    cors: {
        origin: "*",  // Adjust according to your CORS policy
    },
});

console.log("Socket Server is running!");

const socketUsers = new Map();

function sendMessage2Admin(caseId, message) {
    io.to(caseId).emit("case-admin-message", message);
}

function sendFile2Admin(caseId, url) {
    io.to(caseId).emit("case-admin-file", url);
}

function sendMessage2User(caseId, message) {
    io.to(caseId).emit("case-user-message", message);
}

function sendCaseInfo(info) {
    io.emit("case-info", info);
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
    socket.on("case-info", (info) => {
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

// Listen on port 3030 for HTTPS connections
httpsServer.listen(3030, () => {
    console.log('Socket.IO server is running on port 3030');
});

exports.io = io;
exports.socketUsers = socketUsers;
exports.sendCaseInfo = sendCaseInfo;
exports.sendMessage2Admin = sendMessage2Admin;
exports.sendMessage2User = sendMessage2User;
