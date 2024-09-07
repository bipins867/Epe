document.addEventListener("DOMContentLoaded", function () {
    postRequestWithToken("admin/customerSupport/post/pendingCases")
        .then((response) => {
            const cases = response.data;
            console.log(cases);

            // Get the table body element
            const pendingCaseListBody = document.getElementById("pendingCaseListBody");
            const pendingCasesCount = document.getElementById("pendingCasesCount");

            // Update the total pending cases count
            pendingCasesCount.textContent = cases.length;

            // Loop through each case in the response data
            cases.forEach((caseItem) => {
                const { CaseUser, caseId, createdAt, CaseMessages } = caseItem;

                // Determine if there are any unseen messages
                const hasUnseenMessages = CaseMessages.some((msg) => !msg.seenByAdmin);

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
                    <td>
                        <button class="btn btn-outline-primary position-relative action-btn">
                            Open
                            ${hasUnseenMessages ? '<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">New</span>' : ''}
                        </button>
                    </td>
                `;

                // Append the new row to the table body
                pendingCaseListBody.appendChild(row);
            });

            // Add click event listeners for all action buttons
            const actionButtons = document.querySelectorAll(".action-btn");
            actionButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const caseId=this.closest('tr').querySelector('td:nth-child(2)').textContent
                    window.location.replace(`/admin/customerSupport/caseMessages/${caseId}`)
                    // Leave the function blank for now
                });
            });
        })
        .catch((error) => {
            handleErrors(error);
        });
});
