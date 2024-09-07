document.addEventListener("DOMContentLoaded", function () {
    postRequestWithToken("admin/customerSupport/post/closedCases")
        .then((response) => {
            const cases = response.data;
            
            
            // Get the table body and total count elements
            const closedCaseListBody = document.getElementById("closedCaseListBody");
            const closedCasesCount = document.getElementById("closedCasesCount");

            // Update the total closed cases count
            closedCasesCount.textContent = cases.length;

            // Loop through each case in the response data
            cases.forEach((caseItem) => {
                const { CaseUser, caseId, createdAt, closeTime, isClosedByAdmin, isClosedByUser } = caseItem;

                // Determine who closed the case
                let closedBy = "Unknown";
                if (isClosedByAdmin) closedBy = "Admin";
                else if (isClosedByUser) closedBy = "User";

                // Create a new table row
                const row = document.createElement("tr");

                // Add table cells with case information
                row.innerHTML = `
                    <td>${CaseUser.id}</td>
                    <td>${caseId}</td>
                    <td>${CaseUser.name}</td>
                    <td>${CaseUser.email}</td>
                    <td>${CaseUser.isExistingUser ? 'Yes' : 'No'}</td>
                    <td>${new Date(createdAt).toLocaleString()}</td>
                    <td>${closedBy}</td>
                    <td>${closeTime ? new Date(closeTime).toLocaleString() : 'N/A'}</td>
                    <td>
                        <button class="btn btn-outline-primary action-btn">
                            Open
                        </button>
                    </td>
                `;

                // Append the new row to the table body
                closedCaseListBody.appendChild(row);
            });

            // Add click event listeners for all action buttons
            const actionButtons = document.querySelectorAll(".action-btn");
            actionButtons.forEach(button => {
                button.addEventListener('click', function () {
                   const caseId= this.closest('tr').querySelector('td:nth-child(2)').textContent;
                   window.location.replace(`/admin/customerSupport/caseMessages/${caseId}`)
                    // Leave the function blank for now
                });
            });
        })
        .catch((error) => {
            handleErrors(error);
        });
});
