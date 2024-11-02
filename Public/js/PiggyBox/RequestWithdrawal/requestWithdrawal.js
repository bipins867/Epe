function toggleWarning(show) {
  const warningContainer = document.getElementById("warning-container");
  warningContainer.style.display = show ? "block" : "none";
}

// Function to update the warning message
function setWarningContent(message) {
  const warningContent = document.getElementById("warning-content");
  warningContent.textContent = message;
}

document.addEventListener("DOMContentLoaded", async () => {
  toggleWarning(false);
  //setWarningContent("HI there");
  try {
    // Fetch withdrawal information upon page load
    const withdrawalData = await postRequestWithToken(
      "user/piggyBox/requestWithdrawal/post/withdrawalInfo",
      {}
    );

    // Update balance, bank details, and history
    updateWithdrawalInfo(withdrawalData.data);
    updateWithdrawalHistory(withdrawalData.data.withdrawalHistory);

    const bankDetails = withdrawalData.data.bankDetails;
    const kycAccepted = withdrawalData.data.kycAccepted;
    const piggyBoxBalance = withdrawalData.data.piggyBoxBalance;
    if (!kycAccepted) {
      toggleWarning(true);
      setWarningContent("KYC is not Verified.");
      return;
    }
    if (!bankDetails) {
      toggleWarning(true);
      setWarningContent("Please add settelment details first.");
      return;
    }

    if (piggyBoxBalance <= 849) {
      toggleWarning(true);
      setWarningContent(
        "Insufficient Funds!. Minimum balance should be maintained ₹849.00."
      );
      return;
    }
  } catch (error) {
    handleErrors(error, mapFunction);
  }
});

// Function to update the DOM with withdrawal information
function updateWithdrawalInfo(data) {
  const currentBalance = document.getElementById("currentBalance");
  const accountHolderInput = document.getElementById("accountHolder");
  const bankNameInput = document.getElementById("bankName");
  const accountNoInput = document.getElementById("accountNo");
  const ifscCodeInput = document.getElementById("ifscCode");

  // Update the balance
  currentBalance.textContent = data.piggyBoxBalance || "0.00";

  // If no bank details, show a warning
  if (!data.bankDetails || !data.bankDetails.accountHolderName) {
    alert("Please provide bank details before requesting a withdrawal.");
    accountHolderInput.placeholder = "Please enter account holder name";
    bankNameInput.placeholder = "Please enter bank name";
    accountNoInput.placeholder = "Please enter account number";
    ifscCodeInput.placeholder = "Please enter IFSC code";
  } else {
    // Populate bank details if available
    accountHolderInput.value = data.bankDetails.accountHolderName;
    bankNameInput.value = data.bankDetails.bankName;
    accountNoInput.value = data.bankDetails.accountNumber;
    ifscCodeInput.value = data.bankDetails.ifscCode;
  }

  // KYC Status Check
  if (data.kycStatus !== "Completed") {
    alert(
      "Your KYC is not completed. Please complete your KYC before withdrawing funds."
    );
    document.getElementById("withdrawalForm").style.display = "none"; // Hide withdrawal form if KYC not completed
  }
}

// Function to update the withdrawal history table
function updateWithdrawalHistory(withdrawals) {
  const historyTableBody = document.querySelector("#requestHistory tbody");
  historyTableBody.innerHTML = ""; // Clear existing history

  if (withdrawals.length === 0) {
    historyTableBody.innerHTML =
      "<tr><td colspan='8'>No withdrawal history found.</td></tr>";
  } else {
    withdrawals.forEach((withdrawal, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${index + 1}</td>
          <td>${withdrawal.requestId}</td>
          <td>${new Date(withdrawal.requestDate).toLocaleDateString()}</td>
          <td>${withdrawal.candidateId}</td>
          <td>${withdrawal.phone}</td>
          <td>₹${withdrawal.amount}</td>
          <td>${withdrawal.userRemark || "N/A"}</td>
          <td>${withdrawal.status}</td>
        `;
      historyTableBody.appendChild(row);
    });
  }
}

// Handle the withdrawal submission
document.getElementById("submitBtn").addEventListener("click", async () => {
  const amount = document.getElementById("withdrawalAmount").value;
  const narration = document.getElementById("narration").value;

  // Validate amount
  if (!amount || amount <= 0) {
    alert("Please enter a valid withdrawal amount.");
    return;
  }

  try {
    const response = await postRequestWithToken(
      "user/piggyBox/requestWithdrawal/post/addWithdrawalRequest",
      {
        amount: parseFloat(amount),
        userRemark: narration,
      }
    );

    alert("Request Submitted Successfullly!"); // Show success message
    location.reload(); // Reload the page to reflect updated balances and history
  } catch (error) {
    handleErrors(error, mapFunction);
  }
});

// Cancel button logic to clear form inputs
document
  .getElementById("cancelWithdrawalBtn")
  .addEventListener("click", async () => {
    try {
      const response = await postRequestWithToken("user/piggyBox/requestWithdrawal/post/cancelWithdrawalRequest" );

      alert("Request Cancelled Successfullly!"); // Show success message
      location.reload(); // Reload the page to reflect updated balances and history
    } catch (error) {
      handleErrors(error, mapFunction);
    }
  });
