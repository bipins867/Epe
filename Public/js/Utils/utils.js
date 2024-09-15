const baseUrl = `${window.location.protocol}//${window.location.host}/`;

function getAddressWithoutPort(url) {
  // Regular expression to match the address part between protocol and port/path
  const regex = /^(?:https?:\/\/)?([^/:?#]+)(?::\d+)?/;

  // Use regex to extract the match
  const match = url.match(regex);

  // If a match is found, return the matched group; otherwise, return null
  return match ? match[1] : null;
}
const mapFunction = {
  503: (err) => {
    window.location.replace("/user/auth/login");
    localStorage.removeItem("token");
  },
};

async function handleErrors(err,mapFunction, log = true, alertMsg = true) {
  // Declare variables
  let logMessage = null;
  let alertMessage = null;

  // Check if the error has no response (network/server issue)
  if (!err.response) {
    logMessage = "Network error or server is not responding: " + err;
    alertMessage =
      "Network error or server is not responding. Please try again later.";
  } else {
    const { response } = err;

    // Check if response.status exists in mapFunction, and call the corresponding function
    if (mapFunction && response.status in mapFunction) {
      mapFunction[response.status](err); // Call the mapped function
    }

    // Check if the response contains specific error details
    if (response.data && response.data.errors) {
      alertMessage = "Please fix the following errors:\n";
      Object.keys(response.data.errors).forEach((er) => {
        alertMessage += response.data.errors[er] + "\n";
      });
    } else if (response.data && response.data.message) {
      alertMessage = response.data.message; // Message from server
    } else if (response.data && response.data.error) {
      alertMessage = response.data.error; // Error message from server
    } else {
      alertMessage = "An unexpected error occurred. Please try again.";
    }

    logMessage = "Error response: " + JSON.stringify(response);
  }

  // Log the error if log argument is true and logMessage exists
  if (log && logMessage) {
    console.log(logMessage);
  }

  // Show alert if alertMsg argument is true and alertMessage exists
  if (alertMsg && alertMessage) {
    alert(alertMessage);
  }
}
function getTokenHeaders() {
  const token = localStorage.getItem("token");

  if (token == null) {
    window.location.replace("/user/auth/login");
  }
  const headers = { authorization: token };
  return headers;
}
function getChatTokenHeaders() {
  const token = localStorage.getItem("chatToken");

  if (token == null) {
    window.location.reload();
  }
  const headers = { chattoken: token };
  return headers;
}

async function getRequest(url) {
  
  

  const result = await axios.get(baseUrl + url);

  return result;
}

async function postRequest(url, obj) {
  const result = await axios.post(baseUrl + url, obj);

  return result;
}

async function getRequestWithToken(url) {
  const headers = getTokenHeaders();
  if (!headers) {
    return;
  }

  const result = await axios.get(baseUrl + url, { headers });

  return result;
}

async function postRequestWithToken(url, obj) {
  const headers = getTokenHeaders();
  if (!headers) {
    return;
  }

  const result = await axios.post(baseUrl + url, obj, { headers });

  return result;
}
async function postRequestWithChatToken(url, obj) {
  const headers = getChatTokenHeaders();
  if (!headers) {
    return;
  }

  const result = await axios.post(baseUrl + url, obj, { headers });

  return result;
}
