document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Define the API endpoint for getting user info
      const apiEndpoint = "user/piggyBox/kit/post/userInfo";
  
      // Call the API using postRequestWithToken from utils.js
      const response = await postRequestWithToken(apiEndpoint, {});
  
      // Extract the user info from the API response
      const userInfo = response.data;
  
      // Check if the response is successful and contains user data
      if (userInfo) {
        // Update the HTML elements with the user information
        document.getElementById("customer-name").innerText = userInfo.name || "";
        document.getElementById("customer-id").innerText =
          userInfo.candidateId || "";
  
        // You can add more fields here if needed
      } else {
        alert("User information could not be fetched. Please try again.");
      }
    } catch (err) {
      // Handle any errors using handleErrors function from utils.js
      handleErrors(err, mapFunction);
    }
  });
  