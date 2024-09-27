document.addEventListener("DOMContentLoaded", function () {
    postRequestWithToken("admin/customerSupport/post/transferredCases")
      .then((response) => {
        const transferredCases = response.data;
        console.log(transferredCases)
        // Display the number of transferred cases
        document.getElementById("totalTransferredCasesCount").textContent = transferredCases.length;
  
        // Populate the table with transferred case data
        const transferredCaseListBody = document.getElementById("transferredCaseListBody");
        transferredCases.forEach((caseInfo) => {
          const row = document.createElement("tr");
          row.innerHTML = `
          <td>${caseInfo.CaseUserId}</td>
          <td>${caseInfo.caseId}</td>
          <td>${caseInfo.CaseUser.name}</td>
          <td>${caseInfo.CaseUser.email}</td>
          <td>${caseInfo.CaseUser.isExistingUser ? "Yes" : "No"}</td>
          <td>${new Date(caseInfo.updatedAt).toLocaleString()}</td>
          <td><button class="btn btn-primary btn-sm open-case-btn">Open</button></td>
      `;
          transferredCaseListBody.appendChild(row);
        });
  
        // Event listener for the "Open" action buttons
        document.querySelectorAll(".open-case-btn").forEach((button) => {
          button.addEventListener("click", function () {
            // Add logic to handle opening the transferred case
            const caseId =
              this.closest("tr").querySelector("td:nth-child(2)").textContent;
            
            window.location.replace(`/admin/customerSupport/caseMessages/${caseId}`);
          });
        });
      })
      .catch((error) => {
        handleErrors(error, mapFunction);
      });
  });
  