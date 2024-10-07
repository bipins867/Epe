document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Fetch the bank details using postRequestWithToken
      const response = await postRequestWithToken("user/piggyBox/settlement/post/bankDetailsInfo");
  
      // If bank details exist, populate the fields
      if (response && response.data.bankDetails) {
        const { bankName, accountHolderName, accountNumber, ifscCode } = response.data.bankDetails;
        
        // Set the values to the form fields
        document.getElementById("bankName").value = bankName || "";
        document.getElementById("accountHolderName").value = accountHolderName || "";
        document.getElementById("accountNumber").value = accountNumber || "";
        document.getElementById("ifscCode").value = ifscCode || "";
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  });
  
  // Handle form submission for updating bank details
  document.querySelector(".btn-submit").addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default form submission
  
    // Get the input values from the form fields
    const bankName = document.getElementById("bankName").value;
    const accountHolderName = document.getElementById("accountHolderName").value;
    const accountNumber = document.getElementById("accountNumber").value;
    const ifscCode = document.getElementById("ifscCode").value;
  
    // Prepare the request body for updating the bank details
    const data = {
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
    };
  
    try {
      // Make the request to update bank details
      const updateResponse = await postRequestWithToken("user/piggyBox/settlement/post/updateBankDetails", data);
  
      // Handle success
      if (updateResponse) {
        alert(updateResponse.data.message || "Bank details updated successfully.");
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
      alert("Failed to update bank details. Please try again later.");
    }
  });
  