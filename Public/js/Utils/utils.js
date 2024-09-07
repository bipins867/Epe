const baseUrl = `${window.location.protocol}//${window.location.host}/`;

function getAddressWithoutPort(url) {
  // Regular expression to match the address part between protocol and port/path
  const regex = /^(?:https?:\/\/)?([^/:?#]+)(?::\d+)?/;

  // Use regex to extract the match
  const match = url.match(regex);

  // If a match is found, return the matched group; otherwise, return null
  return match ? match[1] : null;
}


async function handleErrors(err) {
  if (!err.response) {
    console.log("Network error or server is not responding:", err);
    alert("Network error or server is not responding. Please try again later.");
    return;
  }
  const { response } = err;

  if (response.status == 503) {
    window.location.replace("/user/auth/login");
    localStorage.removeItem("token");
  }
  // Extract the response data

  // Handle specific error responses
  if (response.data && response.data.errors) {
    let errorMessage = "Please fix the following errors:\n";
    Object.keys(response.data.errors).forEach((er) => {
      errorMessage += response.data.errors[er] + "\n";
    });
    alert(errorMessage);
  } else if (response.data && response.data.message) {
    alert(response.data.message); // Display message from server
  } else if (response.data && response.data.error) {
    alert(response.data.error); // Display error from server if message is not available
  } else {
    alert("An unexpected error occurred. Please try again.");
  }

  console.log("Error response:", response);
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
