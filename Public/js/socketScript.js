let host = getAddressWithoutPort(window.location.host);
const socketPort = localStorage.getItem("socketPort");
const nodeEnv = localStorage.getItem("nodeEnv");

const errorFunction = {
  // socketError: () => {
  //   console.log("FUNction triggered");
  // },
};


let socketUrl;

if (nodeEnv) {
  if (nodeEnv === "testing") {
    socketUrl = `http://${host}:${socketPort}`;
  } else {
    host = "88.222.244.250";
    socketUrl = `https://${host}:${socketPort}`;
  }
} else {
  host = "88.222.244.250";
  socketUrl = `https://${host}:${socketPort}`;
}

console.log(socketUrl);

// Connect to the socket server
const socket = io(socketUrl, {
  transports: ["websocket"], // Use WebSocket transport
  reconnection: true, // Enable reconnection (default is true)
  reconnectionAttempts: Infinity, // Unlimited reconnection attempts (you can change this if needed)
  reconnectionDelay: 5000, // Try to reconnect every 5 seconds
  reconnectionDelayMax: 5000, // Max delay between attempts is also 5 seconds (no exponential backoff)
  timeout: 5000, // Connection timeout before triggering reconnection
});

socket.on("connect", () => {
  console.log(`Connected to Server - ${socketUrl}`);
});

socket.on("connect_error", (err) => {
  //console.error(`Connection error: ${err.message}`);
  handleSocketError(err);
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

function handleSocketError(err) {
  if (errorFunction.socketError) {
    errorFunction.socketError();
  }
}
