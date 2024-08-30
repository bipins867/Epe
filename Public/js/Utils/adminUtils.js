const baseUrl = `${window.location.protocol}//${window.location.host}`;

async function handleErrors(err) {
 
  const re = await err.response;
  const response = re.data;
  if (re.status == 503 || re.status==500) {
    window.location.replace("/admin/login");
  }
  else if(re.status==403){
    window.location.replace("/admin/dashboard");
  }
  if (response.errors) {
    let err = "";
    Object.keys(response.errors).forEach((er) => {
      err = err + response.errors[er] + "\n";
    });
    alert(err);
  } else {
    if (response.message) {
      alert(response.message);
    } else {
      alert(response.error);
    }
  }
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

  try {
    const result = await axios.get(baseUrl + url);

    return result;
  } catch (err) {
    await handleErrors(err);
  }
}

async function postRequest(url, obj) {
  try {
    const result = await axios.post(baseUrl + url, obj);

    return result;
  } catch (err) {
    await handleErrors(err);
  }
}


async function getRequestWithToken(url) {
    const headers = getAdminTokenHeaders();
    if (!headers) {
      return;
    }

  try {
    const result = await axios.get(baseUrl + url,{headers});
    
    return result;
  } catch (err) {
    await handleErrors(err);
  }
}

async function postRequestWithToken(url, obj) {
  const headers = getAdminTokenHeaders();
    if (!headers) {
      return;
    }
  try {
    const result = await axios.post(baseUrl + url, obj,{headers});

    return result;
  } catch (err) {
    await handleErrors(err);
  }
}


