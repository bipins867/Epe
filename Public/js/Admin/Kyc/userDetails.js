document.addEventListener("DOMContentLoaded", async function () {
  try{
    // Extract the phone from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const phone = window.location.pathname.split("/").pop();

  const response = await getRequest("admin/kyc/userDetails/" + phone);

  const userKyc = response.data.userKyc;
  const user = response.data.user;
    
  document.getElementById("profileImage").src = userKyc.userUrl;
  document.getElementById("userId").textContent = userKyc.UserId;
  document.getElementById("name").textContent = user.name; // Update this if name is available in the response
  document.getElementById("email").textContent = user.email;
  document.getElementById("phoneNumber").textContent = user.phone; // Update this if phone number is available in the response
  document.getElementById("dob").textContent = userKyc.dob;

  document.getElementById("aadharNumber").textContent = userKyc.aadharNumber;
  document.getElementById("aadharFront").src = userKyc.aadharFrontUrl;
  document.getElementById("aadharBack").src = userKyc.aadharBackUrl;

  document.getElementById("panNumber").textContent = userKyc.panNumber;
  document.getElementById("panImage").src = userKyc.panUrl;
  }
  catch(err){
    handleErrors(err,mapFunction);
  }
});
const url = "admin/kyc/post/updateStatus";
document.getElementById("approve-btn").onclick = async (event) => {
  // Prevent the default action
  event.preventDefault();

  // Define the phone and status
  const phone = document.getElementById("phoneNumber").textContent; // Assuming you have an input or a way to get the user's phone
  const status = true;

  // Create the object to send in the request
  const obj = { phone, status };
  //console.log(obj);
  // Make the API call
  try {
    const result = await postRequestWithToken(url, obj);

    if (result.status == 201) {
      alert("KYC approved successfully.");
      window.location.replace("/admin/kyc/dashboard/");
    } else {
      alert("Failed to approve KYC: " + result.message);
    }
  } catch (error) {
    handleErrors(error,mapFunction);
  }
};

document.getElementById("reject-btn").onclick = async (event) => {
  // Prevent the default action
  event.preventDefault();

  // Create a prompt for the rejection reason
  const rejectionReason = prompt("Rejection Reason:", "");

  if (rejectionReason) {
    const phone = document.getElementById("phoneNumber").textContent; // Assuming you have an input or a way to get the user's phone
    const status = false;
    const message = rejectionReason; // Use the entered rejection reason

    // Create the object to send in the request
    const obj = { phone, status, message };

    // Make the API call
    try {
      const result = await postRequestWithToken(url, obj);

      if (result.status == 201) {
        alert("KYC rejected successfully.");
        window.location.replace("/admin/kyc/dashboard/");
      } else {
        alert("Failed to reject KYC: " + result.message);
      }
    } catch (error) {
      handleErrors(error,mapFunction);
    }
  } else {
    alert("Rejection reason is required.");
  }
};
