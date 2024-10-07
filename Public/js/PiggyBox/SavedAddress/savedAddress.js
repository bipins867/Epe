document.addEventListener("DOMContentLoaded", async function () {
  // Fetch the saved address info on page load
  try {
    const response = await postRequestWithToken(
      "user/piggyBox/savedAddress/post/addressInfo"
    );

    if (response && response.data.savedAddress) {
      // If saved address exists, populate the form fields
      document.getElementById("addressline1").value =
        response.data.savedAddress.address1 || "";
      document.getElementById("addressline2").value =
        response.data.savedAddress.address2 || "";
      document.getElementById("state").value =
        response.data.savedAddress.state || "";
      document.getElementById("pincode").value =
        response.data.savedAddress.pinCode || "";
    }
  } catch (error) {
    console.error("Error fetching saved address:", error);
    // Handle error if necessary
  }
});

// Handle form submission to update or create the saved address
document
  .querySelector("form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const address1 = document.getElementById("addressline1").value;
    const address2 = document.getElementById("addressline2").value;
    const state = document.getElementById("state").value;
    const pinCode = document.getElementById("pincode").value;

    const data = {
      address1,
      address2,
      state,
      pinCode,
    };

    try {
      const response = await postRequestWithToken(
        "user/piggyBox/savedAddress/post/updateAddressInfo",
        data
      );

      if (response && response.data.message) {
        alert(response.data.message); // Show success message
      }
    } catch (error) {
      console.error("Error updating saved address:", error);
      // Handle error if necessary
    }
  });
