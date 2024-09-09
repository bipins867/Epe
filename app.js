require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
const https = require('https');
const socketIO = require('socket.io');

// Initialize Express app
const app = express();

// Setup static file serving
app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'CustomerFiles')));
app.use(express.static(path.join(__dirname, 'CustomerSupport')));

// Configure CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));

// Use body parser middleware
app.use(bodyParser.json({ extended: false }));

// Setup routes

// Database setup
const db = require("./database");
require('./Models/setModels');
db.sync()
    .then(() => {
        console.log('Database synchronized');
    })
    .catch(err => console.log(err));

// HTTP/HTTPS server setup
const isProduction = process.env.NODE_ENV === 'production';
const options = isProduction ? {
    key: fs.readFileSync('/etc/letsencrypt/live/epeindia.in/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/epeindia.in/fullchain.pem')
} : {}; // For local, we don't need SSL options

const server = isProduction ? https.createServer(options, app) : http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
    cors: {
        origin: "*",  // Adjust according to your CORS policy
    },
});

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

// Endpoint to get server info
app.use('/getServerInfo', (req, res) => {
    return res.status(200).json({
        socketPort: process.env.APP_PORT,
        nodeEnv: process.env.NODE_ENV
    });
});

// Start the server
const port = process.env.APP_PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Exporting Socket.IO related functionalities
exports.io = io;
exports.socketUsers = socketUsers;
exports.sendCaseInfo = sendCaseInfo;
exports.sendMessage2Admin = sendMessage2Admin;
exports.sendMessage2User = sendMessage2User;



const { setupRoutes } = require('./Routes/setupRoutes');
setupRoutes(app);
