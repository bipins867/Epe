document.addEventListener("DOMContentLoaded", function () {
  function getCaseIdFromUrl() {
    const urlParts = window.location.pathname.split("/");
    return urlParts[urlParts.length - 1];
  }

  const caseId = getCaseIdFromUrl();

  // Make a request to fetch case information
  postRequestWithToken(`admin/customerSupport/post/caseInfo/${caseId}`)
    .then((response) => {
      const caseInfo = response.data.caseInfo;

      // Populate case details in the HTML
      document.querySelector(
        ".card-body p:nth-child(2)"
      ).childNodes[1].textContent = ` ${caseInfo.caseId}`;
      document.querySelector(
        ".card-body p:nth-child(3)"
      ).childNodes[1].textContent = ` ${caseInfo.CaseUser.id}`;
      document.querySelector(
        ".card-body p:nth-child(4)"
      ).childNodes[1].textContent = ` ${caseInfo.CaseUser.name}`;
      document.querySelector(
        ".card-body p:nth-child(5)"
      ).childNodes[1].textContent = ` ${caseInfo.CaseUser.email}`;
      document.querySelector(
        ".card-body p:nth-child(6)"
      ).childNodes[1].textContent = ` ${
        caseInfo.CaseUser.candidateId || "N/A"
      }`;
      document.querySelector(
        ".card-body p:nth-child(7)"
      ).childNodes[1].textContent = ` ${
        caseInfo.CaseUser.isExistingUser ? "Yes" : "No"
      }`;
      document.querySelector(
        ".card-body p:nth-child(8)"
      ).childNodes[1].textContent = ` ${new Date(
        caseInfo.creationTime
      ).toLocaleString()}`;
      document.querySelector(
        ".card-body p:nth-child(9)"
      ).childNodes[1].textContent = ` ${
        caseInfo.closeTime
          ? new Date(caseInfo.closeTime).toLocaleString()
          : "N/A"
      }`;
      document.querySelector(
        ".card-body p:nth-child(10)"
      ).childNodes[1].textContent = ` ${caseInfo.status}`;
      document.querySelector(
        ".card-body p:nth-child(11)"
      ).childNodes[1].textContent = ` ${
        caseInfo.isClosedByAdmin
          ? "Admin"
          : caseInfo.isClosedByUser
          ? "User"
          : "N/A"
      }`;

      if (caseInfo.isClosedByAdmin || caseInfo.isClosedByUser) {
        document.getElementById("closeCaseButton").style.display = "none";
        document.getElementById("messageInput").style.display = "none";
        document.getElementById("sendButton").style.display = "none";
      } else {
        socket.emit("join-case", caseId);
      }
    })
    .catch((error) => {
      handleErrors(error,mapFunction);
    });

  postRequestWithToken(`admin/customerSupport/post/caseMessages/${caseId}`)
    .then((response) => {
      const messages = response.data.messages;
      console.log(messages);
      const chatBody = document.getElementById("chatBody");
      chatBody.innerHTML = "";

      if (messages.length === 0) {
        const noMessageElement = document.createElement("div");
        noMessageElement.id = "noMessageFound";
        noMessageElement.textContent = "No message found...";
        chatBody.appendChild(noMessageElement);
      } else {
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

        // Scroll to the bottom after messages are loaded
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    })
    .catch((error) => {
      handleErrors(error,mapFunction);
    });

  document.getElementById("sendButton").addEventListener("click", async () => {
    const messageInput = document.getElementById("messageInput");
    const messageText = messageInput.value.trim();
    if (messageText) {
      try {
        const obj = { message: messageText, caseId: caseId };
        const response = await postRequestWithToken(
          "admin/customerSupport/post/addMessage",
          obj
        );

        const noMessageElement = document.getElementById("noMessageFound");
        if (noMessageElement) {
          noMessageElement.remove();
        }

        const chatBody = document.getElementById("chatBody");
        chatBody.innerHTML += formatServerMessage(messageText);
        messageInput.value = ""; // Clear input after sending

        // Automatically scroll to the bottom after a new message
        chatBody.scrollTop = chatBody.scrollHeight;
      } catch (err) {
        handleErrors(err,mapFunction);
      }
    }
  });

  document
    .getElementById("closeCaseButton")
    .addEventListener("click", async () => {
      if (confirm("Are you sure you want to close this case?")) {
        try {
          await postRequestWithToken("admin/customerSupport/post/closeCase", {
            caseId: caseId,
          });
          alert("Case has been closed.");
          window.location.replace("/admin/customerSupport/dashboard");
        } catch (err) {
          handleErrors(err,mapFunction);
        }
      }
    });

  window.addEventListener("beforeunload", function () {
    socket.emit("leave-case", caseId);
  });
});
function addImageResponseMessage(url) {
  const imgTag = `<div class="message client-message"><img src="/files/CustomerSupport/${url}" alt="Uploaded Image" style="max-width: 200px; height: auto;"/></div>`;

  return imgTag;
}
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
