// Function to fetch loan details based on ID from the URL
async function fetchLoanDetails(id) {
  try {
    // Make the API call to fetch loan details
    const result = await postRequestWithToken(
      `admin/basic/applyLoan/post/applyLoanInfo/${id}`
    );

    // Assuming the API response is an object with loan details
    const loan = result.data;

    // Update the DOM with loan details
    document.getElementById("name").textContent = loan.name;
    document.getElementById("email").textContent = loan.email;
    document.getElementById("phoneNumber").textContent = loan.phoneNumber;
    document.getElementById("loanType").textContent = loan.loanType;
    document.getElementById("reasonForLoan").textContent = loan.reasonForLoan;
    document.getElementById("statusChecked").textContent = loan.statusChecked
      ? "Yes"
      : "No";
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}

// Function to submit the admin remark
async function submitRemark(id) {
  const adminRemark = document.getElementById("adminRemark").value;

  try {
    // Make the API call to submit the remark
    await postRequestWithToken(
      `admin/basic/applyLoan/post/addAdminRemark/${id}`,
      { adminRemark }
    );
    alert("Remark submitted successfully!");
    window.location.replace("/admin/basic/openApplyLoanList");
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}

// Fetch the loan details when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const pathSegments = window.location.pathname.split("/");
  const id = pathSegments[pathSegments.length - 1]; // Assuming the ID is passed as a query parameter
  if (id) {
    fetchLoanDetails(id);

    // Add event listener for the submit remark button
    document.getElementById("submitRemarkBtn").addEventListener("click", () => {
      submitRemark(id);
    });
  } else {
    console.error("ID not found in URL");
  }
});
