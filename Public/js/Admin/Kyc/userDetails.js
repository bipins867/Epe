document.addEventListener("DOMContentLoaded", async function () {
  // Extract the emailId from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const emailId = window.location.pathname.split("/").pop();

  const response = await getRequest("admin/kyc/userDetails/" + emailId);

  const userKyc = response.data.userKyc;

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
const url = "admin/kyc/post/updateStatus";
document.getElementById("approve-btn").onclick = async (event) => {
  // Prevent the default action
  event.preventDefault();

  // Define the email and status
  const email = document.getElementById("email").textContent; // Assuming you have an input or a way to get the user's email
  const status =true;

  // Create the object to send in the request
  const obj = { email, status };
  //console.log(obj);
  // Make the API call
  try {
    const result = await postRequest(url, obj);

    if (result.status == 201) {
      alert("KYC approved successfully.");
    } else {
      alert("Failed to approve KYC: " + result.message);
    }
  } catch (error) {
    console.error("Error approving KYC:", error);
    alert("An error occurred while approving KYC.");
  }
};

document.getElementById("reject-btn").onclick = async (event) => {
  // Prevent the default action
  event.preventDefault();

  // Create a prompt for the rejection reason
  const rejectionReason = prompt("Rejection Reason:", "");

  if (rejectionReason) {
    const email = document.getElementById("email").textContent;// Assuming you have an input or a way to get the user's email
    const status = false;
    const message = rejectionReason; // Use the entered rejection reason

    // Create the object to send in the request
    const obj = { email, status, message };
   
    
    // Make the API call
    try {
      const result = await postRequest(url, obj);

      if (result.status == 201) {
        alert("KYC rejected successfully.");
      } else {
        alert("Failed to reject KYC: " + result.message);
      }
    } catch (error) {
      console.error("Error approving KYC:", error);
      alert("An error occurred while approving KYC.");
    }
  } else {
    alert("Rejection reason is required.");
  }
};
