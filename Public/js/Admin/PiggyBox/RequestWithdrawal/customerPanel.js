// Function to extract candidateId from URL
function getCandidateIdFromUrl() {
  const urlSegments = window.location.pathname.split("/");
  return urlSegments[urlSegments.length - 1]; // Get the last segment which is the candidateId
}

document.addEventListener("DOMContentLoaded", async () => {
  const candidateId = getCandidateIdFromUrl();

  try {
    // Call customerInfo API
    const customerInfoEndpoint = `admin/piggyBox/requestWithdrawal/post/customerInfo`;
    const customerInfoResponse = await postRequestWithToken(
      customerInfoEndpoint,
      { candidateId }
    );

    if (customerInfoResponse) {
      const customer = customerInfoResponse.data.user;
      const piggyBox = customerInfoResponse.data.piggyBox;
      const bankDetails = customerInfoResponse.data.bankDetails;
      const withdrawals = customerInfoResponse.data.withdrawals;
      //console.log(customerInfoResponse);
      // Update customer profile details
      document.getElementById("name").textContent = customer.name || "N/A";
      document.getElementById("email").textContent = customer.email || "N/A";
      document.getElementById("phone").textContent = customer.phone || "N/A";
      document.getElementById("employeeId").textContent =
        customer.employeeId || "N/A";
      document.getElementById("candidateId").textContent =
        customer.candidateId || "N/A";
      document.getElementById("kyc").textContent = customer.kycStatus || "N/A";

      // Update piggy box details
      document.getElementById("piggyBalance").textContent =
        piggyBox.piggyBalance || "N/A";
      document.getElementById("unclearedBalance").textContent =
        piggyBox.unclearedBalance || "N/A";
      document.getElementById("interestBalance").textContent =
        piggyBox.interestBalance || "N/A";
      document.getElementById("isFundedFirst").textContent =
        piggyBox.isFundedFirst ? "Yes" : "No";

      if (bankDetails) {
        // Update bank details
        document.getElementById("bankName").textContent =
          bankDetails.bankName || "N/A";
        document.getElementById("accountNumber").textContent =
          bankDetails.accountNumber || "N/A";
        document.getElementById("accountHolderName").textContent =
          bankDetails.accountHolderName || "N/A";
        document.getElementById("ifscCode").textContent =
          bankDetails.ifscCode || "N/A";
      }

      // Update pending withdrawal request if available
      if (withdrawals.pending.length > 0) {
        const pendingRequest = withdrawals.pending[0]; // Assuming there's only one pending request

        document.getElementById("requestId").textContent =
          pendingRequest.requestId || "N/A";
        document.getElementById("createdAt").textContent =
          new Date(pendingRequest.createdAt).toLocaleDateString() || "N/A";
        document.getElementById("amount").textContent =
          pendingRequest.amount || "N/A";
        document.getElementById("status").textContent =
          pendingRequest.status || "N/A";

        // Show withdrawal request section if pending requests exist
        document.querySelector(".deposit-balance").style.display = "block";
        const requestId = pendingRequest.requestId;
        // Approve request
        document
          .getElementById("approve-request-btn")
          .addEventListener("click", async () => {
            if (confirm("Are you sure you want to approve this request?")) {
              const updateStatusEndpoint = `admin/piggyBox/requestWithdrawal/post/updateStatus`;
              const approveResponse = await postRequestWithToken(
                updateStatusEndpoint,
                {
                  status: "Approved",
                  adminRemark: "",
                  candidateId,
                  requestId,
                }
              );

              alert("Request approved successfully!");
              location.reload(); // Reload the page to reflect changes
            }
          });

        // Reject request
        document
          .getElementById("reject-request-btn")
          .addEventListener("click", async () => {
            const userRemark = prompt("Please provide a reason for rejection:");

            if (userRemark) {
              if (confirm("Are you sure you want to reject this request?")) {
                const updateStatusEndpoint = `admin/piggyBox/requestWithdrawal/post/updateStatus`;
                const rejectResponse = await postRequestWithToken(
                  updateStatusEndpoint,
                  {
                    status: "Rejected",
                    adminRemark: userRemark,
                    candidateId,
                    requestId,
                  }
                );

                alert("Request rejected successfully!");
                location.reload(); // Reload the page to reflect changes
              }
            } else {
              alert("Rejection requires a remark.");
            }
          });
      } else {
        document.getElementById("withdrawal-request").style.display = "none";
      }

      // Populate non-pending withdrawal request history
      const withdrawalHistoryBody = document.querySelector(".table tbody");
      withdrawals.nonPending.forEach((withdrawal, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${withdrawal.requestId}</td>
            <td>${new Date(withdrawal.createdAt).toLocaleDateString()}</td>
            <td>${withdrawal.amount}</td>
            <td>${withdrawal.userRemark || "N/A"}</td>
            <td>${withdrawal.adminRemark || "N/A"}</td>
            <td>${withdrawal.status || "N/A"}</td>
            
            
          `;
        withdrawalHistoryBody.appendChild(row);
      });
    } else {
      console.error(
        "Failed to load customer info:",
        customerInfoResponse.message
      );
    }
  } catch (error) {
    handleErrors(error);
  }
});
