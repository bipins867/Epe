document.addEventListener("DOMContentLoaded", async function () {
  // Extract the emailId from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const emailId = window.location.pathname.split("/").pop();

  const response = await getRequest("admin/kyc/userDetails/" + emailId);

  const userKyc =  response.data.userKyc;
  
  document.getElementById("profileImage").src = userKyc.userUrl;
  document.getElementById("userId").textContent = userKyc.UserId;
  document.getElementById("name").textContent = "John Doe"; // Update this if name is available in the response
  document.getElementById("email").textContent = emailId;
  document.getElementById("phoneNumber").textContent = "+1-800-555-1234"; // Update this if phone number is available in the response
  document.getElementById("dob").textContent = userKyc.dob;

  document.getElementById("aadharNumber").textContent = userKyc.aadharNumber;
  document.getElementById("aadharFront").src = userKyc.aadharFrontUrl;
  document.getElementById("aadharBack").src = userKyc.aadharBackUrl;

  document.getElementById("panNumber").textContent = userKyc.panNumber;
  document.getElementById("panImage").src = userKyc.panUrl;
});
