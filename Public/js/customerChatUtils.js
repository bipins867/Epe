function formatInfoMessage() {
  return `<div class="d-flex justify-content-center mb-2" id="info-box">
    <div class="info-box text-center p-2 small">
      Now you are connected with our agent. Feel free to ask to query.
    </div>
  </div>`;
}

function formatClientMessage(message) {
  return `<div class="d-flex justify-content-end mb-2">
            <div class="message client-message">
              ${message}
            </div>
          </div>`;
}

function formatServerMessage(message) {
  return `<div class="d-flex justify-content-start mb-2">
            <div class="message server-message">
              ${message}
            </div>
          </div>`;
}
// Function to add an image message to the chatbox
function addImageResponseMessage(url) {
  // Create the image message with appropriate Bootstrap and custom classes
  const imgTag = `
    <div class="d-flex justify-content-end mb-2">
      <div class="message client-message">
        <img src="files/CustomerSupport/${url}" alt="Uploaded Image" style="max-width: 200px; height: auto;"/>
      </div>
    </div>
  `;

  return imgTag;
}

function prepareOptionTemplate(messageDict, headingMessage) {
  var mess = `<div class="message server-message">${headingMessage}</div><div class="options">`;

  for (const option of messageDict) {
    const message = messageDict[option].message;
    const func = messageDict[option].func;
    mess += `<button class="btn btn-outline-primary option-btn" onclick="${handleOption(
      message
    )}">${message}</button>`;
  }
  mess += `</div>`;
}

function updatePropertyStatus(show, elementId) {
  const propertyObj = document.getElementById(elementId);
  if (show) {
    propertyObj.style.display = "flex";
  } else {
    propertyObj.style.display = "none";
  }
}

function updateCloseCaseButtonStatus(show) {
  updatePropertyStatus(show, "closeCase");
}

function updateChatBoxStatus(show) {
  updatePropertyStatus(show, "chatBox");
}

function updateAttachmentIconStatus(show) {
  updatePropertyStatus(show, "attachmentIcon");
}

function updateSendFileButtonStatus(show) {
  updatePropertyStatus(show, "fileSendButton");
}

function updateFileInputStatus(show) {
  updateAttachmentIconStatus(show);
  updateSendFileButtonStatus(show);
}
