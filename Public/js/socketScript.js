let host = getAddressWithoutPort(window.location.host);
const socketPort = localStorage.getItem("socketPort");
const nodeEnv = localStorage.getItem("nodeEnv");

host="88.222.244.250";
let socketUrl;

if (nodeEnv) {
  if (nodeEnv === "testing") {
    socketUrl = `http://localhost:${socketPort}`;
  } else {
    socketUrl = `https://${host}:${socketPort}`;
  }
} else {
  socketUrl = `https://${host}:${socketPort}`;
}

console.log(socketUrl);

// Connect to the socket server
const socket = io(socketUrl, {
  transports: ['websocket'] // Ensure using WebSocket
});

socket.on("connect", () => {
  console.log(`Connected to Server - ${socketUrl}`);
});

socket.on("connect_error", (err) => {
  console.error(`Connection error: ${err.message}`);
});

socket.on("disconnect", () => {
  console.log(`Disconnected from Server - ${socketUrl}`);
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
