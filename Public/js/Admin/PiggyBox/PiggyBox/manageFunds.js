document.addEventListener("DOMContentLoaded", async () => {
    const candidateId = getCandidateIdFromUrl();
    try {
        
        // Fetch customer info and transaction history
        let  customerInfoResponse = await postRequestWithToken("admin/piggyBox/post/customerInfo",{candidateId});
        let  transactionHistoriesResponse = await postRequestWithToken("admin/piggyBox/post/transactionHistory",{candidateId});

        customerInfoResponse=customerInfoResponse.data;
        transactionHistoriesResponse=transactionHistoriesResponse.data;
        
        
        // Update customer profile
        if (customerInfoResponse.success) {
            const userInfo=customerInfoResponse.data.user;
            const piggyBox=customerInfoResponse.data.piggyBox;
            
            

            document.getElementById("name").innerText = userInfo.name;
            document.getElementById("email").innerText = userInfo.email;
            document.getElementById("phone").innerText = userInfo.phone;
            document.getElementById("employeeId").innerText = userInfo.employeeId;
            document.getElementById("candidateId").innerText = userInfo.candidateId;
            document.getElementById("isRequestedClosure").innerText = piggyBox.piggyBalance.toFixed(2);
            document.getElementById("isActive").innerText = piggyBox.unclearedBalance.toFixed(2);
            document.getElementById("byReferralId").innerText = piggyBox.interestBalance.toFixed(2);
            document.getElementById("joiningDate").innerText = new Date(userInfo.createdAt).toLocaleDateString() ;
        }

        // Update transaction history
        if (transactionHistoriesResponse.success) {
            const tbody = document.querySelector("table tbody");
            tbody.innerHTML = ""; // Clear existing rows
            transactionHistoriesResponse.transactionHistories.forEach((transaction, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
                    <td>${transaction.merchantTransactionId?transaction.merchantTransactionId:'N/A'}</td>
                    <td>${transaction.remark}</td>
                    <td>${transaction.debit.toFixed(2)}</td>
                    <td>${transaction.credit.toFixed(2)}</td>
                    <td>${transaction.balance.toFixed(2)}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }

    // Event listeners for deposit and deduct buttons
    document.getElementById("deposite-funds-btn").addEventListener("click", async () => {
        const amount = document.getElementById("deposit-amount").value;
        const remark = document.getElementById("deposit-remark").value;

        if (confirm("Are you sure you want to deposit funds?")) {
            try {
                const response = await postRequestWithToken("admin/piggyBox/post/addFunds", { amount, remark,candidateId });
                if (response.data.success) {
                    alert("Funds deposited successfully!");
                    window.location.reload()
                    // Optionally, refresh customer info or update UI here
                } else {
                    alert(response.message);
                }
            } catch (error) {
                console.error("Error adding funds:", error);
            }
        }
    });

    document.getElementById("deduct-funds-btn").addEventListener("click", async () => {
        const amount = document.getElementById("deduct-amount").value;
        const remark = document.getElementById("deduct-remark").value;

        if (confirm("Are you sure you want to deduct funds?")) {
            try {
                const response = await postRequestWithToken("admin/piggyBox/post/deductFunds", { amount, remark,candidateId });
                if (response.data.success) {
                    alert("Funds deducted successfully!");
                    window.location.reload()
                    // Optionally, refresh customer info or update UI here
                } else {
                    alert(response.message);
                }
            } catch (error) {
                console.error("Error deducting funds:", error);
            }
        }
    });

    // Event listener for Get Result button
    document.querySelector(".btn-primary").addEventListener("click", async () => {
        const fromDate = document.getElementById("fromDate").value;
        const toDate = document.getElementById("toDate").value;
        const limit = document.getElementById("limit").value;

        try {
            const response = await postRequestWithToken("admin/piggyBox/post/transctionHistor", { fromDate, toDate, limit });
            if (response.success) {
                const tbody = document.querySelector("table tbody");
                tbody.innerHTML = ""; // Clear existing rows
                response.transactionHistories.forEach((transaction, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
                        <td>${transaction.merchantTransactionId}</td>
                        <td>${transaction.remark}</td>
                        <td>${transaction.debit.toFixed(2)}</td>
                        <td>${transaction.credit.toFixed(2)}</td>
                        <td>${transaction.balance.toFixed(2)}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error("Error fetching transaction history:", error);
        }
    });
});
// Function to extract candidateId from URL
function getCandidateIdFromUrl() {
    const urlSegments = window.location.pathname.split("/");
    return urlSegments[urlSegments.length - 1]; // Get the last segment which is the candidateId
  }
  