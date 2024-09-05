document.addEventListener("DOMContentLoaded", function () {
  // Check for chatToken in localStorage
  const chatToken = localStorage.getItem("chatToken");
  if (chatToken) {
    // If chatToken exists, show input field and call getInitialMessage function
    showInputField(true);
    getInitialMessage();
  } else {
    // If chatToken does not exist, hide input field and show initial options
    showInputField(false);
    showInitialOptions();
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
  chatBody.innerHTML+=formatClientMessage(option)
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

function getInitialMessage() {
  // Leave this function blank
}




function createCaseFunction(name, email, candidateId) {
  // Implement the function logic here
  console.log("createCaseFunction called with:", { name, email, candidateId});

  const obj={name,email,candidateId,isExistingUser:true }
  createCase(obj);
}

function createCaseFunction2(name, email) {
  // Implement the function logic here
  console.log("createCaseFunction2 called with:", { name, email});

  const obj={name,email,isExistingUser:false }
  createCase(obj);
}

async function createCase(obj){
 
  try{
    const response=await postRequest('customerSupport/post/createCase',obj)
    const data=response.data;
    const chatToken=data.chatToken;
    console.log(chatToken);
   // localStorage.setItem('chatToken',chatToken);
   document.getElementById("sendMessage").onclick = function () {
    handleSendingInputMessage()
   }
   
  }
  catch(err){
    handleErrors(err)
  }
}


function handleSendingInputMessage(){
  const msg = document.getElementById("messageInput").value.trim();
  console.log(msg)
  document.getElementById("messageInput").value='';
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

document
  .getElementById("fileSendButton")
  .addEventListener("click", function () {
    const fileInput = document.getElementById("fileInput");
    const chatBody = document.getElementById("chatBody");

    if (fileInput.files.length > 0) {
      const fileMessage = document.createElement("div");
      fileMessage.className = "message client-message";
      fileMessage.textContent = `File sent: ${fileInput.files[0].name}`;
      chatBody.appendChild(fileMessage);
      chatBody.scrollTop = chatBody.scrollHeight;

      // Clear the file input
      fileInput.value = "";
      this.style.display = "none";
    }
  });

document.getElementById("chatButton").addEventListener("click", function () {
  const chatBox = document.getElementById("chatBox");
  chatBox.style.display = chatBox.style.display === "flex" ? "none" : "flex";
});

document.getElementById("closeChat").addEventListener("click", function () {
  document.getElementById("chatBox").style.display = "none";
});
