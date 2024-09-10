document.addEventListener("DOMContentLoaded", async function () {
  // Check for chatToken in localStorage
  const chatToken = localStorage.getItem("chatToken");
  const caseId = localStorage.getItem("caseId");

  if (chatToken && caseId) {
    // Fetch case details to check if it's closed
    checkCaseStatus(caseId);
  } else {
    // If chatToken does not exist, hide input field and show initial options
    showInputField(false);
    showInitialOptions();
  }
});

document
  .getElementById("attachmentIcon")
  .addEventListener("click", function () {
    // Trigger click on the hidden file input
    document.getElementById("fileInput").click();
  });
document.getElementById("fileSendButton").onclick = function () {
  handleFileUpload();
};
// Function to handle file upload
async function handleFileUpload() {
  const chatToken = localStorage.getItem("chatToken");
  const caseId = localStorage.getItem("caseId");
  const fileInput = document.getElementById("fileInput");
  console.log("File input element:", fileInput);

  const file = fileInput.files[0];
  console.log("Selected file:", file);

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    alert("Only image files (jpg, png, gif) are allowed.");
    fileInput.value = ""; // Clear the file input
    return;
  }

  const formData = new FormData();
  formData.append("userFile", file);
  formData.append("caseId", caseId);

  try {
    const response = await axios.post(
      baseUrl + "customerSupport/post/addFile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          chattoken: chatToken,
        },
      }
    );

    const fileUrl = response.data.fileMessage.message;
    console.log(fileUrl);
    //Display image in chatbox
    addUserResponseImage(fileUrl);
  } catch (err) {
    alert("Error uploading file: " + err.message);
  }
}

async function checkCaseStatus(caseId) {
  try {
    const response = await postRequest("customerSupport/post/caseInfo", {
      caseId: caseId,
    });
    const isCaseClosed =
      response.data.caseInfo.isClosedByAdmin ||
      response.data.caseInfo.isClosedByUser; // Assuming 'isClosed' is returned from the server

    if (isCaseClosed) {
      alert("Case is already closed!");
      // If case is closed, remove chatToken and caseId from localStorage and refresh the page
      localStorage.removeItem("chatToken");
      localStorage.removeItem("caseId");
      location.reload();
    } else {
      showInputField(true);
      getInitialMessage();
      document.getElementById("sendMessage").onclick = function () {
        handleSendingInputMessage();
      };
    }
  } catch (err) {
    handleErrors(err);
  }
}

document.getElementById("closeCase").addEventListener("click", async () => {
  try {
    const caseId = localStorage.getItem("caseId");
    await postRequestWithChatToken("customerSupport/post/closeCase", {
      caseId: caseId,
    });

    // Remove chatToken and caseId from localStorage
    localStorage.removeItem("chatToken");
    localStorage.removeItem("caseId");

    // Refresh the page
    location.reload();
  } catch (err) {
    handleErrors(err);
  }
});

function showInitialOptions() {
  const chatBody = document.getElementById("chatBody");
  chatBody.innerHTML = `
        <div class="message server-message">Are you an existing user or a new user?</div>
        <div class="options">
            <button class="btn btn-outline-primary option-btn" onclick="handleOption('existing')">Existing User</button>
            <button class="btn btn-outline-primary option-btn" onclick="handleOption('new')">New User</button>
        </div>
    `;
}

function finishPreTemplateConversation() {
  // Show input field and send button after predefined conversation
  showInputField(true);
  document.getElementById("closeCase").style.display = "block"; // Show the Close Case button
}

function handleOption(option) {
  const chatBody = document.getElementById("chatBody");
  chatBody.innerHTML += formatClientMessage(option);
  clearOptions();

  if (option === "existing") {
    chatBody.innerHTML += formatServerMessage("Please enter your email:");
    showInputField(true);
    document.getElementById("sendMessage").onclick = function () {
      const email = document.getElementById("messageInput").value.trim();
      if (email) {
        chatBody.innerHTML += formatClientMessage(email);
        chatBody.innerHTML += formatServerMessage("Please enter your name:");
        document.getElementById("messageInput").value = "";

        // Handle name input
        document.getElementById("sendMessage").onclick = function () {
          const name = document.getElementById("messageInput").value.trim();
          if (name) {
            chatBody.innerHTML += formatClientMessage(name);
            chatBody.innerHTML += formatServerMessage(
              "Please enter your candidate ID:"
            );
            document.getElementById("messageInput").value = "";

            // Handle candidate ID input
            document.getElementById("sendMessage").onclick = function () {
              const candidateId = document
                .getElementById("messageInput")
                .value.trim();
              document.getElementById("messageInput").value = "";
              if (candidateId) {
                chatBody.innerHTML += formatClientMessage(candidateId);
                createCaseFunction(name, email, candidateId);
                clearChatBox();
              } else {
                chatBody.innerHTML += formatServerMessage(
                  "Candidate ID cannot be empty."
                );
              }
            };
          } else {
            chatBody.innerHTML += formatServerMessage("Name cannot be empty.");
          }
        };
      } else {
        chatBody.innerHTML += formatServerMessage("Email cannot be empty.");
      }
    };
  } else if (option === "new") {
    chatBody.innerHTML += formatServerMessage(
      "Would you like to know about our services or talk to an agent?"
    );
    chatBody.innerHTML += `
          <div class="options">
              <button class="btn btn-outline-primary option-btn" onclick="handleOption('services')">Know about Services</button>
              <button class="btn btn-outline-primary option-btn" onclick="handleOption('agent')">Talk to Agent</button>
          </div>
      `;
  } else if (option === "services") {
    knowService(); // Call the function and log to the console
    finishPreTemplateConversation(); // Finish conversation setup

    // Hide options after selection
  } else if (option === "agent") {
    chatBody.innerHTML += formatServerMessage("Please enter your email:");
    showInputField(true);

    document.getElementById("sendMessage").onclick = function () {
      const email = document.getElementById("messageInput").value.trim();
      if (email) {
        chatBody.innerHTML += formatClientMessage(email);
        chatBody.innerHTML += formatServerMessage("Please enter your name:");
        document.getElementById("messageInput").value = "";

        // Handle name input
        document.getElementById("sendMessage").onclick = function () {
          const name = document.getElementById("messageInput").value.trim();
          document.getElementById("messageInput").value = "";
          if (name) {
            chatBody.innerHTML += formatClientMessage(name);
            createCaseFunction2(name, email);
            clearChatBox();
          } else {
            chatBody.innerHTML += formatServerMessage("Name cannot be empty.");
          }
        };
      } else {
        chatBody.innerHTML += formatServerMessage("Email cannot be empty.");
      }
    };
  } else {
    console.log(`Somethign else ${option}`);
  }
  // Hide options after selection
}

function clearOptions() {
  const options = document.querySelectorAll(".options");
  if (options) {
    for (const opt of options) {
      opt.style.display = "none";
    }
  }
}

function knowService() {
  // Call the function and log to the console
  console.log("Know about services requested.");
}

function showInputField(show) {
  const chatFooter = document.getElementById("chatFooter");
  chatFooter.style.display = show ? "flex" : "none";
}

async function getInitialMessage() {
  const caseId = localStorage.getItem("caseId");
  const obj = { caseId: caseId };
  try {
    const response = await postRequest(
      "customerSupport/post/CaseMessages",
      obj
    );
    const messages = response.data.messages; // Assuming messages is the array from the response

    updateChatBox(messages);

    socket.emit("join-case", caseId); // Call the function to update chatbox
  } catch (err) {
    handleErrors(err);
  }
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
// Function to update the chatbox with new messages
function updateChatBox(messages) {
  const chatBody = document.getElementById("chatBody");
  console.log(messages);
  // Loop through messages and append them to the chatbox
  messages.forEach((message) => {
    let formattedMessage;
    if (message.isFile) {
      formattedMessage = addImageResponseMessage(message.message);
    } else {
      formattedMessage = message.isAdminSend
        ? formatServerMessage(message.message)
        : formatClientMessage(message.message);
    }

    chatBody.innerHTML += formattedMessage;
  });

  // Check if there are more than 20 messages

  checkAndUpdateChatBoxLength();
  // Scroll to the bottom of the chatbox
  chatBody.scrollTop = chatBody.scrollHeight;
}
function addUserResponseImage(fileUrl) {
  const chatBody = document.getElementById("chatBody");

  const msg = addImageResponseMessage(fileUrl);
  chatBody.innerHTML += msg;
  checkAndUpdateChatBoxLength();
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addUserResponseMessage(message) {
  const chatBody = document.getElementById("chatBody");

  const msg = formatClientMessage(message);
  chatBody.innerHTML += msg;
  checkAndUpdateChatBoxLength();
  chatBody.scrollTop = chatBody.scrollHeight;
}
function addAdminResponseMessage(message) {
  const chatBody = document.getElementById("chatBody");

  const msg = formatServerMessage(message);
  chatBody.innerHTML += msg;
  checkAndUpdateChatBoxLength();
  chatBody.scrollTop = chatBody.scrollHeight;
}

function createCaseFunction(name, email, candidateId) {
  // Implement the function logic here
  console.log("createCaseFunction called with:", { name, email, candidateId });

  const obj = { name, email, candidateId, isExistingUser: true };
  createCase(obj);
}

function createCaseFunction2(name, email) {
  // Implement the function logic here
  console.log("createCaseFunction2 called with:", { name, email });

  const obj = { name, email, isExistingUser: false };
  createCase(obj);
}

async function createCase(obj) {
  try {
    const response = await postRequest("customerSupport/post/createCase", obj);
    const data = response.data;
    const chatToken = data.chatToken;

    localStorage.setItem("chatToken", chatToken);
    localStorage.setItem("caseId", data.caseId);
    document.getElementById("sendMessage").onclick = function () {
      handleSendingInputMessage();
    };
    socket.emit("join-case", data.caseId);
  } catch (err) {
    handleErrors(err);
  }
}

async function handleSendingInputMessage() {
  const msg = document.getElementById("messageInput").value.trim();
  document.getElementById("messageInput").value = "";
  if (msg === "") {
    return;
  }
  try {
    const obj = { message: msg, isFile: false };
    const response = await postRequestWithChatToken(
      "customerSupport/post/addMessage",
      obj
    );
    //console.log(respons)
    const message = response.data.infoMessage.message;

    addUserResponseMessage(message);
  } catch (err) {
    handleErrors(err);
  }
}
function clearChatBox() {
  const chatBody = document.getElementById("chatBody");
  chatBody.innerHTML = ""; // Clear chat box content
}

// File input visibility and logic remain the same
document.getElementById("fileInput").addEventListener("change", function () {
  const fileSendButton = document.getElementById("fileSendButton");
  fileSendButton.style.display =
    this.files.length > 0 ? "inline-block" : "none";
});

// document
//   .getElementById("fileSendButton")
//   .addEventListener("click", function () {
//     const fileInput = document.getElementById("fileInput");
//     const chatBody = document.getElementById("chatBody");

//     if (fileInput.files.length > 0) {
//       const fileMessage = document.createElement("div");
//       fileMessage.className = "message client-message";
//       fileMessage.textContent = `File sent: ${fileInput.files[0].name}`;
//       chatBody.appendChild(fileMessage);
//       chatBody.scrollTop = chatBody.scrollHeight;

//       // Clear the file input
//       fileInput.value = "";
//       this.style.display = "none";
//     }
//   });

document.getElementById("chatButton").addEventListener("click", function () {
  const chatBox = document.getElementById("chatBox");
  chatBox.style.display = chatBox.style.display === "flex" ? "none" : "flex";
});

document.getElementById("closeChat").addEventListener("click", function () {
  document.getElementById("chatBox").style.display = "none";
});

document.getElementById("closeCase").addEventListener("click", async () => {
  try {
    const caseId = localStorage.getItem("caseId");
    await postRequestWithChatToken("customerSupport/post/closeCase", {
      caseId: caseId,
    });

    localStorage.removeItem("caseId");
    localStorage.removeItem("chatToken");

    window.location.reload();
  } catch (err) {
    handleErrors(err);
  }
});
