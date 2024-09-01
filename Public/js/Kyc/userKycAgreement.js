document.addEventListener("DOMContentLoaded", async function () {
  // Get the accept button element by ID

  try {
    const response = await getRequestWithToken("user/kyc/userKycAgreementInfo");

    const userAgreement = response.data.userAgreement;
    const userKyc = response.data.userKyc;
    const status = response.data.status;

    if (
      !userKyc ||
      userAgreement ||
      status == "Pending" ||
      status == "Rejected"
    ) {
      window.location.href = "/user/dashboard";
    }
  } catch (err) {
    handleErrors(err);
  }

  const acceptButton = document.getElementById("acceptButton");

  // Add a click event listener to the accept button
  acceptButton.addEventListener("click", async function () {
    try {
      document.getElementById("acceptButton").disabled = true;
      // Make a POST request to accept the user agreement
      const response = await getRequestWithToken(
        "user/kyc/acceptUserAgreement"
      );

      if (response.status === 200) {
        // If the response is successful, redirect the user or show a success message
        alert("Agreement accepted successfully!");
        window.location.href = "/user/dashboard"; // Redirect to the dashboard or desired page
      }
    } catch (error) {
      document.getElementById("acceptButton").disabled = false;
      handleErrors(error);
    }
  });

  document.getElementById('agreement-checkbox').addEventListener('change', function() {
    var button = document.getElementById('acceptButton');
    button.disabled = !this.checked;
});
});
