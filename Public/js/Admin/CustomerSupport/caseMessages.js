document.addEventListener("DOMContentLoaded", function () {
  // Function to extract the caseId from the URL
  function getCaseIdFromUrl() {
    const urlParts = window.location.pathname.split("/");
    return urlParts[urlParts.length - 1]; // Assuming the caseId is always the last part of the path
  }

  // Get the caseId from the URL
  const caseId = getCaseIdFromUrl();

  // Make a request to fetch case information
  postRequestWithToken(`admin/customerSupport/post/caseInfo/${caseId}`)
    .then((response) => {
      const caseInfo = response.data.caseInfo;

      // Populate case details in the HTML
      document.querySelector(".card-body p:nth-child(2)").childNodes[1].textContent = ` ${caseInfo.caseId}`;
      document.querySelector(".card-body p:nth-child(3)").childNodes[1].textContent = ` ${caseInfo.CaseUser.id}`;
      document.querySelector(".card-body p:nth-child(4)").childNodes[1].textContent = ` ${caseInfo.CaseUser.name}`;
      document.querySelector(".card-body p:nth-child(5)").childNodes[1].textContent = ` ${caseInfo.CaseUser.email}`;
      document.querySelector(".card-body p:nth-child(6)").childNodes[1].textContent = ` ${caseInfo.CaseUser.candidateId || "N/A"}`;
      document.querySelector(".card-body p:nth-child(7)").childNodes[1].textContent = ` ${caseInfo.CaseUser.isExistingUser ? "Yes" : "No"}`;
      document.querySelector(".card-body p:nth-child(8)").childNodes[1].textContent = ` ${new Date(caseInfo.creationTime).toLocaleString()}`;
      document.querySelector(".card-body p:nth-child(9)").childNodes[1].textContent = ` ${caseInfo.closeTime ? new Date(caseInfo.closeTime).toLocaleString() : "N/A"}`;
      document.querySelector(".card-body p:nth-child(10)").childNodes[1].textContent = ` ${caseInfo.status}`;
      document.querySelector(".card-body p:nth-child(11)").childNodes[1].textContent = ` ${caseInfo.isClosedByAdmin ? "Admin" : caseInfo.isClosedByUser ? "User" : "N/A"}`;

      // Hide the "Close Case" button, input field, and send button if the case is already closed
      if (caseInfo.isClosedByAdmin || caseInfo.isClosedByUser) {
        document.getElementById("closeCaseButton").style.display = "none";
        document.getElementById("messageInput").style.display = "none";
        document.getElementById("sendButton").style.display = "none";
      } else {
        socket.emit("join-case", caseId);
      }
    })
    .catch((error) => {
      handleErrors(error);
    });

  // Make a request to fetch case messages
  postRequestWithToken(`admin/customerSupport/post/caseMessages/${caseId}`)
    .then((response) => {
      const messages = response.data.messages;
      const chatBody = document.getElementById("chatBody");
      chatBody.innerHTML = ""; // Clear existing messages

      // Show "No message found..." if no messages are available
      if (messages.length === 0) {
        const noMessageElement = document.createElement("div");
        noMessageElement.id = "noMessageFound";
        noMessageElement.textContent = "No message found...";
        chatBody.appendChild(noMessageElement);
      } else {
        messages.forEach((message) => {
          const formattedMessage = message.isAdminSend ? formatServerMessage(`${message.message}`) : formatClientMessage(` ${message.message}`);
          chatBody.innerHTML += formattedMessage;
        });
      }
    })
    .catch((error) => {
      handleErrors(error);
    });

  // Send message functionality
  document.getElementById("sendButton").addEventListener("click", async () => {
    const messageInput = document.getElementById("messageInput");
    const messageText = messageInput.value.trim();
    if (messageText) {
      try {
        const obj = { message: messageText, caseId: caseId };
        const response = await postRequestWithToken("admin/customerSupport/post/addMessage", obj);

        // Remove "No message found..." if it exists
        const noMessageElement = document.getElementById("noMessageFound");
        if (noMessageElement) {
          noMessageElement.remove();
        }

        chatBody.innerHTML += formatServerMessage(messageText);
        messageInput.value = ""; // Clear input after sending
        chatBody.scrollTop = chatBody.scrollHeight;
      } catch (err) {
        handleErrors(err);
      }
    }
  });

  // Close Case functionality
  document.getElementById("closeCaseButton").addEventListener("click", () => {
    if (confirm("Are you sure you want to close this case?")) {
      // Handle the close case logic here, e.g., send an API request
      alert("Case has been closed.");
    }
  });

  // Listen for page unload (user closes the tab, refreshes, or navigates away)
  window.addEventListener("beforeunload", function () {
    socket.emit("leave-case", caseId);
  });
});

// Function to format server and client messages
function formatServerMessage(message) {
  return `<div class="message server-message">${message}</div>`;
}

function formatClientMessage(message) {
  return `<div class="message client-message">${message}</div>`;
}

function checkAndUpdateChatBoxLength() {
  const chatBody = document.getElementById("chatBody");
  const messageElements = chatBody.children;
  if (messageElements.length > 20) {
    // Remove older messages if there are more than 20
    const excessMessages = messageElements.length - 20;
    for (let i = 0; i < excessMessages; i++) {
      chatBody.removeChild(messageElements[0]);
    }
  }
}

function addUserResponseMessage(message) {
  const chatBody = document.getElementById("chatBody");

  const msg = formatClientMessage(message);
  chatBody.innerHTML += msg;
  checkAndUpdateChatBoxLength();
  chatBody.scrollTop = chatBody.scrollHeight;
}
