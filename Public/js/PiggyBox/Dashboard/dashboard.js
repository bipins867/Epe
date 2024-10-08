document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Fetch initial PiggyBox Info and transactions
      const piggyBoxData = await postRequestWithToken("user/piggyBox/post/getPiggyBoxInfo", {});
      updatePiggyBoxInfo(piggyBoxData.data);
      updateTransactionHistory(piggyBoxData.data.transactionHistory);
    } catch (error) {
      console.error("Error loading PiggyBox Info:", error);
    }
  });
  
  // Update DOM with PiggyBox info
  function updatePiggyBoxInfo(data) {
    document.getElementById("customer-name").textContent = data.name;
    document.getElementById("customer-id").textContent = data.customerId;
    document.getElementById("kyc-status").textContent = data.kycStatus==='Completed'?'Verified':data.kycStatus;
    document.getElementById("piggybox-balance").textContent = data.piggyboxBalance;
    document.getElementById("piggybox-uncleared-balance").textContent = data.unclearedBalance;
  }
  
  // Update transaction history in the table
  function updateTransactionHistory(transactions) {
    const transactionTable = document.getElementById("transaction-table");
    transactionTable.innerHTML = ""; // Clear existing transactions
  
    transactions.forEach(transaction => {
      // Extract date and time from the createdAt field
      const createdAt = new Date(transaction.createdAt);
      const date = createdAt.toLocaleDateString(); // Format as 'MM/DD/YYYY' or as per locale
      const time = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format as 'HH:MM AM/PM'
  
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${transaction.transactionType || 'N/A'}</td> <!-- Show transaction type -->
        <td>${transaction.remark || 'No description'}</td> <!-- Show remark as description -->
        <td>${transaction.credit ? `₹${transaction.credit}` : '₹0'}</td> <!-- Show credit -->
        <td>${transaction.debit ? `₹${transaction.debit}` : '₹0'}</td> <!-- Show debit -->
        <td>${transaction.balance ? `₹${transaction.balance}` : '₹0'}</td> <!-- Show balance -->
      `;
      transactionTable.appendChild(row);
    });
  }
  
  // Handle 'Get Transactions' button click
  document.getElementById("btnFetchTransactions").addEventListener("click", async () => {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
  
    if (!fromDate || !toDate) {
      alert("Please select both 'From' and 'To' dates.");
      return;
    }
  
    try {
      const transactions = await postRequestWithToken("user/piggyBox/post/getTransactionHistory", { fromDate, toDate });
      updateTransactionHistory(transactions.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  });
  