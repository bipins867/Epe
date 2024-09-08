const host=getAddressWithoutPort(window.location.host);
const socketPort=localStorage.getItem('socketPort');

const socketUrl = `https://${host}:${socketPort}`;

// Connect to the socket server
const socket = io(socketUrl);

socket.on("connect", () => {
  console.log(`Connect to Server - ${socketUrl}`);
});
socket.on("disconnect", () => {
  console.log(`Disconnected from the Server - ${socketUrl}`);
});

// Function to handle messages broadcasted to the case room
function handleCaseMessage(message) {
  
  addAdminResponseMessage(message);
}

// Function to handle case info broadcasted to all clients
function handleCaseInfo(info) {
  console.log("Received case info:", info);
}

// Event listeners for messages
socket.on("case-user-message", handleCaseMessage);
socket.on("case-info", handleCaseInfo);

// Example function to join a case room
function joinCase(caseId) {
  socket.emit("join-case", caseId);
}

// Example function to leave a case room
function leaveCase() {
  socket.emit("leave-case");
}