document.addEventListener("DOMContentLoaded", async () => {
  // DOM elements
  const piggyboxBalanceInput = document.getElementById("piggyboxBalance");
  const transferToCustomerInput = document.getElementById("transferToCustomer");
  const transferReserveInput = document.getElementById("transferReserve");
  const customerNameInput = document.getElementById("customerName");
  const remarksInput = document.getElementById("remarks");
  const submitBtn = document.getElementById("submitBtn");
  const verifyUserBtn = document.getElementById("verifyUserBtn");
  const transactionHistorySection =
    document.getElementById("transactionHistory");

  // Disable form fields function
  const disableFormFields = () => {
    transferToCustomerInput.disabled = true;
    transferReserveInput.disabled = true;
    customerNameInput.disabled = true;
    remarksInput.disabled = true;
    submitBtn.disabled = true;
  };

  // Enable form fields function
  const enableFormFields = () => {
    transferToCustomerInput.disabled = false;
    transferReserveInput.disabled = false;
    remarksInput.disabled = false;
    verifyUserBtn.disabled = false;
  };

  // Step 1: Fetch the initial transfer info
  try {
    const response = await postRequestWithToken(
      "user/piggyBox/transferMoney/post/getTransferInfo",
      {}
    );
    const { piggyBoxBalance, kycStatus, userKycAccepted } = response.data;

    // Update Piggybox balance
    piggyboxBalanceInput.value = piggyBoxBalance.toFixed(2);

    // Check KYC status and disable form fields if needed
    if (kycStatus !== "Completed" || !userKycAccepted) {
      disableFormFields();
      const label = document.createElement("label");
      label.classList.add("text-danger");
      label.textContent = "KYC pending or agreement not accepted";
      submitBtn.insertAdjacentElement("afterend", label);
    } else {
      enableFormFields();
    }
  } catch (error) {
    handleErrors(error);
    disableFormFields();
    const label = document.createElement("label");
    label.classList.add("text-danger");
    label.textContent = "Error fetching user details.";
    submitBtn.insertAdjacentElement("afterend", label);
  }

  // Step 2: Verify user on clicking "Verify User" button
  verifyUserBtn.addEventListener("click", async () => {
    const transferToCustomer = transferToCustomerInput.value.trim();
    if (!transferToCustomer) {
      alert("Please enter a valid customer ID");
      return;
    }

    try {
      const response = await postRequestWithToken(
        "user/piggyBox/transferMoney/post/getTransferUserInfo",
        {
          candidateId: transferToCustomer,
        }
      );
      customerNameInput.value = response.data.name;
    } catch (error) {
      handleErrors(error);
    }
  });

  // Step 3: Handle form submission for money transfer
  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const transferToCustomer = transferToCustomerInput.value.trim();
    const transferReserve = transferReserveInput.value.trim();
    const customerName = customerNameInput.value.trim();
    const remarks = remarksInput.value.trim();

    if (!transferToCustomer || !transferReserve || !customerName) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await postRequestWithToken(
        "user/piggyBox/transferMoney/post/transferMoney",
        {
          candidateId: transferToCustomer,
          amount: transferReserve,
          name: customerName,
          userRemark: remarks,
        }
      );

      alert(response.data.message);
      // Optionally, reset the form after successful transfer
      document.querySelector("form").reset();
      customerNameInput.value = "";
      location.reload();
    } catch (error) {
      handleErrors(error);
    }
  });

  // Step 4: Fetch transaction history after transfer
  try {
    const historyResponse = await postRequestWithToken(
      "user/piggyBox/transferMoney/post/getTopTransactionHistory",
      {}
    );
    const transactions = historyResponse.data || [];
    console.log(historyResponse.data);
    if (transactions.length > 0) {
      const tbody = transactionHistorySection.querySelector("tbody");
      tbody.innerHTML = ""; // Clear existing data

      transactions.forEach((transaction) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                      <td>${new Date(
                        transaction.createdAt
                      ).toLocaleDateString()}</td>
                      <td>${new Date(
                        transaction.createdAt
                      ).toLocaleTimeString()}</td>
                      <td>${transaction.transactionType}</td>
                      <td>${transaction.remark}</td>
                      <td>${transaction.credit || ""}</td>
                      <td>${transaction.debit || ""}</td>
                      <td>${transaction.balance.toFixed(2)}</td>
                  `;
        tbody.appendChild(row);
      });
    }
  } catch (error) {
    handleErrors(error);
  }
});
