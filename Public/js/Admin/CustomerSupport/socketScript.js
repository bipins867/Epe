let host = getAddressWithoutPort(window.location.host);
const socketPort = localStorage.getItem("socketPort");
const nodeEnv = localStorage.getItem("nodeEnv");

let socketUrl;

const errorFunction = {
  // socketError: () => {
  //   console.log("FUNction triggered");
  // },
};



// Detect protocol dynamically (http => ws, https => wss)
const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";

// Determine socket URL based on environment
if (nodeEnv) {
  if (nodeEnv === "testing") {
    // In testing environment, use the provided socket port with ws:// or wss://
    socketUrl = `${protocol}${host}:${socketPort}`;
  } else {
    // In production or other environments, use the /socket endpoint
    socketUrl = `${protocol}${host}/socket`;
  }
} else {
  // Default to production-like behavior if no environment is set
  socketUrl = `${protocol}${host}/socket`;
}

console.log(socketUrl);

// Connect to the socket server
const socket = io(socketUrl, {
  transports: ["websocket"], // Use WebSocket transport
  reconnection: true, // Enable reconnection (default is true)
  reconnectionAttempts: Infinity, // Unlimited reconnection attempts (can be adjusted)
  reconnectionDelay: 5000, // Try to reconnect every 5 seconds
  reconnectionDelayMax: 5000, // Max delay between attempts is also 5 seconds (no exponential backoff)
  timeout: 5000, // Connection timeout before triggering reconnection
});


socket.on("connect", () => {
  console.log(`Connect to Server - ${socketUrl}`);
});
socket.on("disconnect", () => {
  console.log(`Disconnected from the Server - ${socketUrl}`);
});

// Function to handle messages broadcasted to the case room
function handleCaseMessage(message) {
  
  addUserResponseMessage(message);
}

// Function to handle case info broadcasted to all clients
function handleCaseInfo(info) {
  console.log("Received case info:", info);
}

// Event listeners for messages
socket.on("case-admin-message", handleCaseMessage);
socket.on("case-info", handleCaseInfo);

// Example function to join a case room
function joinCase(caseId) {
  socket.emit("join-case", caseId);
}

// Example function to leave a case room
function leaveCase() {
  socket.emit("leave-case");
}