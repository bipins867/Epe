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
