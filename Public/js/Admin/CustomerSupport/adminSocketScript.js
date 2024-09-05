// Connect to the socket server
const socket = io('http://localhost:3030');

// Function to handle messages broadcasted to the case room
function handleCaseMessage(message) {
    console.log('Received case message:', message);
}

// Function to handle case info broadcasted to all clients
function handleCaseInfo(info) {
    console.log('Received case info:', info);
}

// Event listeners for messages
socket.on('case-message', handleCaseMessage);
socket.on('case-info', handleCaseInfo);

// Example function to join a case room
function joinCase(caseId) {
    socket.emit('join-case', caseId);
}

// Example function to leave a case room
function leaveCase() {
    socket.emit('leave-case');
}

// Example function to broadcast case info to all clients
function broadcastCaseInfo(info) {
    socket.emit('case-info', info);
}
