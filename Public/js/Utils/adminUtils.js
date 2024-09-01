const baseUrl = `${window.location.protocol}//${window.location.host}/`;

async function handleErrors(err) {
  if (!err.response) {
    console.log("Network error or server is not responding:", err);
    alert("Network error or server is not responding. Please try again later.");
    return;
  }

  // Extract the response data
  const { response } = err;

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
function getAdminTokenHeaders() {
  const token = localStorage.getItem("adminToken");

  if (token == null) {
    window.location.replace("/admin/login");
  }
  const headers = { authorization: token };
  return headers;
}

async function getRequest(url) {
  //   const headers = getTokenHeaders();
  //   if (!headers) {
  //     return;
  //   }

  const result = await axios.get(baseUrl + url);

  return result;
}

async function postRequest(url, obj) {
  const result = await axios.post(baseUrl + url, obj);

  return result;
}

async function getRequestWithToken(url) {
  const headers = getAdminTokenHeaders();
  if (!headers) {
    return;
  }

  const result = await axios.get(baseUrl + url, { headers });

  return result;
}

async function postRequestWithToken(url, obj) {
  const headers = getAdminTokenHeaders();
  if (!headers) {
    return;
  }

  const result = await axios.post(baseUrl + url, obj, { headers });

  return result;
}
