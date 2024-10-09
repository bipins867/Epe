document.addEventListener("DOMContentLoaded", () => {
  // Function to extract the merchantTransactionId from the URL
  function getMerchantTransactionIdFromUrl() {
    const url = window.location.href;
    const parts = url.split("/");
    return parts[parts.length - 1]; // Assuming the merchantTransactionId is the last part of the URL
  }

  // Function to fetch payment status
  function fetchPaymentStatus() {
    const merchantTransactionId = getMerchantTransactionIdFromUrl(); // Extract the ID from the URL
    const apiUrl = "user/piggyBox/post/checkPaymentStatus"; // Adjust API URL as necessary

    // Make the API request with the extracted merchantTransactionId
    postRequestWithToken(apiUrl, { merchantTransactionId })
      .then((response) => {
        response = response.data;
        // Assuming the response contains these fields
        document.getElementById("merchantTransactionId").textContent =
          response.merchantTransactionId || "N/A";
        document.getElementById("paymentStatus").textContent =
          response.status || "N/A";
        document.getElementById("paymentAmount").textContent =
          response.amount || "N/A";
        document.getElementById("paymentTime").textContent =
          new Date(response.time) || "N/A";

        // Optionally, you can add logic to handle different statuses
        // e.g., displaying success or error messages based on the status
      })
      .catch((error) => {
        handleErrors(error,mapFunction);
        // Optionally, display an error message to the user
      });
  }

  // Call the function to fetch payment status
  fetchPaymentStatus();
});
