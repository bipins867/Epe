const baseUrl = "http://localhost:3000/";

async function handleErrors(err) {
  const re = await err.response;
  const response=re.data;
   if(re.status==503){
    window.location.replace("/");
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
function getTokenHeaders() {
  const token = localStorage.getItem("token");

  if (token == null) {
    window.location.replace("/user/auth/login");
  }
  const headers = { authorization: token };
  return headers;
}

async function getRequest(url) {
  const headers = getTokenHeaders();
  if (!headers) {
    return;
  }

  try {
    const result=await axios.get(baseUrl+url,{headers})
    
    return result;
  } catch (err) {
    
    await handleErrors(err);
  }
}

async function postRequest() {}

async function getRequestWithToken(url) {
  const headers = getTokenHeaders();
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
const headers = getTokenHeaders();
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

