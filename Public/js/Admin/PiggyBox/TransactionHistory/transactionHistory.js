document.addEventListener("DOMContentLoaded", async () => {
    // Function to populate the table with transaction histories
    const populateTable = (data) => {
      const tableBody = document.getElementById("transactionTable");
      tableBody.innerHTML = ""; // Clear the table body
      data.forEach((transaction, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
          <td>${transaction.transactionType}</td>
          <td>${transaction.User.candidateId}</td>
          <td>${transaction.remark}</td>
          <td>${transaction.debit}</td>
          <td>${transaction.credit}</td>
          <td>${transaction.balance}</td>
        `;
        tableBody.appendChild(row);
      });
    };
  
    // Fetch top transaction histories on page load
    try {
      const response = await postRequestWithToken("admin/piggyBox/transactionHistory/post/transactionHistories");
      populateTable(response.data.data);
    } catch (error) {
      handleErrors(error)
    }
  
    // Handle the click event for "Get Result" button
    document.getElementById("getDetails").addEventListener("click", async () => {
      const fromDate = document.getElementById("fromDate").value;
      const toDate = document.getElementById("toDate").value;
      const limit = document.getElementById("limit").value;
  
      // Basic validation
      if (!fromDate || !toDate) {
        alert("Please select both From Date and To Date.");
        return;
      }
  
      try {
        const response = await postRequestWithToken(
          "admin/piggyBox/transactionHistory/post/customDateTransactionHistories",
          {
            fromDate,
            toDate,
            limit: limit || 20 // Send the limit, default to 20 if not provided
          }
        );
  
        populateTable(response.data.data);
       
        
      } catch (error) {
        handleErrors(error)
      }
    });
  });
  