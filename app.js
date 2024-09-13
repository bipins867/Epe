const fs = require('fs');
const http = require('http');
const https = require('https');
const socketIO = require('socket.io');
const app = require('./appConfig'); // Import the Express app

// Check if we are in production environment
const isProduction = process.env.NODE_ENV === 'production';

let server;
const options = isProduction ? {
    key: fs.readFileSync('/etc/letsencrypt/live/heartmeet.in.net/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/heartmeet.in.net/fullchain.pem')
} : {}; // For local, we don't need SSL options

// Create HTTP or HTTPS server based on environment
if (isProduction) {
    server = https.createServer(options, app); // Attach Express app to HTTPS server
} else {
    server = http.createServer(app); // Attach Express app to HTTP server
}

// Attach Socket.IO to the server
const io = socketIO(server, {
    cors: {
        origin: "*",  // Adjust according to your CORS policy
    },
});

console.log(`Socket Server is running in ${isProduction ? 'production' : 'development'} mode!`);

// Socket.IO functionality
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

    socket.on("join-case", (caseId) => {
        socket.join(caseId);
        socketUsers.set(socket.id, caseId);
        console.log(`User ${socket.id} joined room: ${caseId}`);
    });

    socket.on("leave-case", () => {
        const caseId = socketUsers.get(socket.id);
        if (caseId) {
            socket.leave(caseId);
            socketUsers.delete(socket.id);
            console.log(`User ${socket.id} left room: ${caseId}`);
        }
    });

    socket.on("case-info", (info) => {
        sendCaseInfo(info);
    });

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

// Listen on the same port for both the Express app and Socket.IO server
const port = process.env.APP_PORT || 3000;
server.listen(port, () => {
    console.log(`Server and Socket.IO are running on port ${port}`);
});

exports.io = io;
exports.socketUsers = socketUsers;
exports.sendCaseInfo = sendCaseInfo;
exports.sendMessage2Admin = sendMessage2Admin;
exports.sendMessage2User = sendMessage2User;
