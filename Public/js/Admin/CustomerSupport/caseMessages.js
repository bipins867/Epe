// Function to format messages
function formatServerMessage(message) {
    return `<div class="message server-message">
        ${message}
      </div>`;
}

function formatClientMessage(message) {
    return `<div class="message client-message">
        ${message}
      </div>`;
}

// Dummy chat messages
const chatMessages = [
    { type: 'server', message: 'Hello, how can I assist you today?' },
    { type: 'client', message: 'I need help with my account.' },
    { type: 'server', message: 'Sure, I will check your account details.' },
    { type: 'client', message: 'Thank you!' },
];

// Display dummy chat messages
const chatBody = document.getElementById('chatBody');
chatMessages.forEach(chat => {
    const formattedMessage = chat.type === 'server' 
        ? formatServerMessage(chat.message) 
        : formatClientMessage(chat.message);
    chatBody.innerHTML += formattedMessage;
});

// Send message functionality
document.getElementById('sendButton').addEventListener('click', () => {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    if (messageText) {
        chatBody.innerHTML += formatClientMessage(messageText);
        messageInput.value = ''; // Clear input after sending
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll to bottom
    }
});

// Close Case functionality
document.getElementById('closeCaseButton').addEventListener('click', () => {
    if (confirm("Are you sure you want to close this case?")) {
        // Handle the close case logic here, e.g., send an API request
        alert("Case has been closed.");
    }
});
