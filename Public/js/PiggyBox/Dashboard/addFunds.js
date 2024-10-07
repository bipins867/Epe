// addFunds.js

document.addEventListener("DOMContentLoaded", function () {
  // Access the form by its ID
  const form = document.getElementById("addFundForm");

  // Handle form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the fund amount from the input field
    const amount = parseFloat(document.getElementById("fund").value);

    // Check if the amount is valid
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    // Make the API request to add funds
    const apiUrl = "user/piggyBox/post/addFunds"; // Replace with your actual API endpoint
    const payload = {
      amount: amount,
    };

    postRequestWithToken(apiUrl, payload)
      .then((response) => {
        const redirectUrl = response.data.redirectInfo.url;
        window.open(redirectUrl, "_blank"); // Change to your desired URL
      })
      .catch((error) => {
        console.error("Error adding funds:", error);
        // Optionally, display an error message to the user
      });
  });
});
