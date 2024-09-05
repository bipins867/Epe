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
