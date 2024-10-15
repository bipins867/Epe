document.addEventListener("DOMContentLoaded", async () => {
  const candidateId = getCandidateIdFromUrl();

  // Fetch customer information on DOM load
  await getCustomerInformation(candidateId);

  // Event listener for updating customer details
  document.querySelector(".btn-primary").addEventListener("click", async () => {
    if (confirm("Are you sure you want to update customer profile?")) {
      await updateCustomerInformation(candidateId);
    }
  });

  // Event listener for updating block status
  document
    .querySelector(".btn-secondary")
    .addEventListener("click", async () => {
      if (confirm("Are you sure you want to update the user block status?")) {
        await updateBlockedStatus(candidateId);
      }
    });

  document
    .getElementById("active-status-update-btn")
    .addEventListener("click", async () => {
      if (confirm("Are you sure you want to update the user active status?")) {
        await updateActiveStatus(candidateId);
      }
    });
});

// Function to extract candidateId from URL
function getCandidateIdFromUrl() {
  const urlSegments = window.location.pathname.split("/");
  return urlSegments[urlSegments.length - 1]; // Get the last segment which is the candidateId
}

// Function to fetch customer information
async function getCustomerInformation(candidateId) {
  try {
    const response = await postRequestWithToken(
      "admin/piggyBox/customer/post/customerInfo",
      { candidateId }
    );

    const data = await response.data;

    if (data.success) {
      const { user, piggyBox, bankDetails, savedAddress } = data.data;

      // Populate form fields with fetched user data
      document.getElementById("name").value = user.name || "";
      document.getElementById("email").value = user.email || "";
      document.getElementById("phone").value = user.phone || "";
      document.getElementById("employeeId").value = user.employeeId || "";
      document.getElementById("candidateId").value = user.candidateId || "";
      document.getElementById("isRequestedClouser").value =
        user.isRequestedClouser ? "YES" : "NO";
      document.getElementById("isActive").value = user.isActive ? "YES" : "NO";
      document.getElementById("byReferralId").value = user.byReferralId || "";
      document.getElementById("joiningDate").value = new Date(
        user.createdAt
      ).toLocaleDateString();

      // Disable/Enable block toggle based on isBlocked status
      document.getElementById("blockToggle").checked = user.isBlocked;
      document.getElementById("activeToggle").checked = user.isActive;

      if (user.isActive) {
        document.getElementById("active-block-state").style.display = "none";
      }
      // Populate PiggyBox details
      document.getElementById("piggyBalance").innerText = `₹${
        piggyBox.piggyBalance || 0
      }`;
      document.getElementById("unclearedBalance").innerText = `₹${
        piggyBox.unclearedBalance || 0
      }`;
      document.getElementById("interestBalance").innerText = `₹${
        piggyBox.interestBalance || 0
      }`;
      document.getElementById("isFundedFirst").innerText =
        piggyBox.isFundedFirst ? "Yes" : "No";

      // Populate BankDetails
      document.getElementById("bankName").innerText = bankDetails
        ? bankDetails.bankName
        : "N/A";
      document.getElementById("accountNumber").innerText = bankDetails
        ? bankDetails.accountNumber
        : "N/A";
      document.getElementById("bankUserName").innerText = bankDetails
        ? bankDetails.accountHolderName
        : "N/A";
      document.getElementById("ifscCode").innerText = bankDetails
        ? bankDetails.ifscCode
        : "N/A";

      // Populate SavedAddress details
      document.getElementById("address1").innerText = savedAddress
        ? savedAddress.address1
        : "N/A";
      document.getElementById("address2").innerText = savedAddress
        ? savedAddress.address2
        : "N/A";
      document.getElementById("addressState").innerText = savedAddress.state
        ? savedAddress.state
        : "N/A";
      document.getElementById("pincode").innerText = savedAddress
        ? savedAddress.pinCode
        : "N/A";
    }
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}

// Function to update customer information
async function updateCustomerInformation(candidateId) {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const employeeId = document.getElementById("employeeId").value;

  try {
    const response = await postRequestWithToken(
      "admin/piggyBox/customer/post/updateCustomer",
      { candidateId, name, email, phone, employeeId }
    );

    const data = await response.data;

    alert("Customer profile updated successfully.");
    location.reload();
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}

// Function to update block status
async function updateBlockedStatus(candidateId) {
  const isBlocked = document.getElementById("blockToggle").checked;
  const adminRemark = isBlocked
    ? "User blocked by admin"
    : "User unblocked by admin";

  try {
    const response = await postRequestWithToken(
      "admin/piggyBox/customer/post/blockedStatus",
      { candidateId, isBlocked, adminRemark }
    );

    const data = await response.data;

    alert("Status updated Successfully!");
    location.reload();
  } catch (error) {
    handleErrors(error,mapFunction);
  }
}
// Function to update block status
async function updateActiveStatus(candidateId) {
  const isActive = document.getElementById("activeToggle").checked;
  const adminRemark = isActive
    ? "User active by admin"
    : "User inActive by admin";

  try {
    const response = await postRequestWithToken(
      "admin/piggyBox/customer/post/activeStatus",
      { candidateId, isActive, adminRemark }
    );

    const data = await response.data;

    alert("Status updated Successfully!");
    location.reload();
  } catch (error) {
    handleErrors(error,mapFunction);
  }
}
