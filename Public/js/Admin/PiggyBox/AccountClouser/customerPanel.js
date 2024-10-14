document.addEventListener("DOMContentLoaded", async () => {
  // Extract candidateId from URL
  const candidateId = getCandidateIdFromUrl();

  try {
    // Fetch customer information
    const customerInfoResponse = await postRequestWithToken(
      `admin/piggyBox/accountClouser/post/customerInfo`,
      { candidateId }
    );
    const customerInfo = await customerInfoResponse.data;

    const userInformation = customerInfo.userInformation;
    const piggyBox = customerInfo.piggyBoxInformation;
    const bankDetails = customerInfo.bankDetailsInformation;
    //console.log(customerInfo)
    // Display customer profile information
    document.getElementById("name").innerText = userInformation.name;
    document.getElementById("email").innerText = userInformation.email;
    document.getElementById("phone").innerText = userInformation.phone;
    document.getElementById("employeeId").innerText =
      userInformation.employeeId;
    document.getElementById("candidateId").innerText =
      userInformation.candidateId;
    document.getElementById("joiningDate").innerText =
      userInformation.createdAt;

    if (piggyBox) {
      document.getElementById("piggyBalance").innerText = piggyBox.piggyBalance;
      document.getElementById("unclearedBalance").innerText =
        piggyBox.unclearedBalance;
      document.getElementById("interestBalance").innerText =
        piggyBox.interestBalance;
      document.getElementById("isFundedFirst").innerText =
        piggyBox.isFundedFirst;
    }

    if (bankDetails) {
      document.getElementById("bankName").innerText = bankDetails.bankName;
      document.getElementById("accountNumber").innerText =
        bankDetails.accountNumber;
      document.getElementById("accountHolderName").innerText =
        bankDetails.accountHolderName;
      document.getElementById("ifscCode").innerText = bankDetails.ifscCode;
    }

    // Check for pending withdrawals
    const pendingWithdrawals = customerInfo.pendingWithdrawals;
    const withdrawalSection = document.getElementById("withdrawal-request");
    const decisionSection = document.getElementById("withdrawal-decision");

    if (userInformation.isRequestedClouser) {
      withdrawalSection.style.display = "block";
      decisionSection.style.display = "block";

      // Update Withdrawal Request information
      const withdrawalRequest = customerInfo.withdrawalHistory.pending[0];
      //console.log(withdrawalRequest)
      document.getElementById("requestId").innerText =
        withdrawalRequest.requestId;
      document.getElementById("createdAt").innerText =
        withdrawalRequest.createdAt;
      document.getElementById("amount").innerText = withdrawalRequest.amount;
      document.getElementById("status").innerText = withdrawalRequest.status;
    } else {
      withdrawalSection.style.display = "none";
      decisionSection.style.display = "none";
    }

    // Approve request button click event
    document
      .getElementById("approve-request-btn")
      .addEventListener("click", async () => {
        const confirmApprove = confirm(
          "Are you sure you want to approve this request?"
        );
        if (confirmApprove) {
          // Call approveRequest API
          const approveResponse = await postRequestWithToken(
            `admin/piggyBox/accountClouser/post/approveRequest`,
            {
              candidateId,
            }
          );

          alert("Request approved successfully!");
          // Optionally, refresh or update UI here
          window.location.reload();
        }
      });

    // Reject request button click event
    document
      .getElementById("reject-request-btn")
      .addEventListener("click", async () => {
        const remark = prompt("Please provide a remark for rejection:");
        if (remark) {
          const confirmReject = confirm(
            "Are you sure you want to reject this request?"
          );
          if (confirmReject) {
            // Call rejectRequest API
            const rejectResponse = await postRequestWithToken(
              `admin/piggyBox/accountClouser/post/rejectRequest`,
              {
                candidateId,
                remark,
              }
            );

            alert("Request rejected successfully!");
            // Optionally, refresh or update UI here
            window.location.reload();
          }
        }
      });
  } catch (error) {
    handleErrors(error);
  }
});

function getCandidateIdFromUrl() {
  const urlSegments = window.location.pathname.split("/");
  return urlSegments[urlSegments.length - 1]; // Get the last segment which is the candidateId
}
