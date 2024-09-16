// Dummy list of case information

document.addEventListener("DOMContentLoaded", function () {
  postRequestWithToken("admin/customerSupport/post/openCases")
    .then((response) => {
      const cases = response.data;

      // Display the number of cases
      document.getElementById("totalCasesCount").textContent = cases.length;

      // Populate the table with case data
      const caseListBody = document.getElementById("caseListBody");
      cases.forEach((caseInfo) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${caseInfo.CaseUserId}</td>
        <td>${caseInfo.caseId}</td>
        <td>${caseInfo.CaseUser.name}</td>
        <td>${caseInfo.CaseUser.email}</td>
        <td>${caseInfo.CaseUser.isExistingUser ? "Yes" : "No"}</td>
        <td>${new Date(caseInfo.creationTime).toLocaleString()}</td>
        <td><button class="btn btn-primary btn-sm open-case-btn">Open</button></td>
    `;
        caseListBody.appendChild(row);
      });
      // Event listener for the "Open" action buttons
      document.querySelectorAll(".open-case-btn").forEach((button) => {
        button.addEventListener("click", function () {
          // Add logic to handle opening the case

          const caseId =
            this.closest("tr").querySelector("td:nth-child(2)").textContent;
          
          window.location.replace(`/admin/customerSupport/caseMessages/${caseId}`)
        });
      });
    })
    .catch((error) => {
      handleErrors(error,mapFunction);
    });
});
