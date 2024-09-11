// Fetch and display counts of cases
document.addEventListener('DOMContentLoaded', function () {
    postRequestWithToken('admin/customerSupport/post/dashboardInfo')
        .then(response => {
            const { numberOfOpenCases, numberOfPendingCases, numberOfClosedCases, pendingCasesWithUnSeenMessages } = response.data;
            console.log(pendingCasesWithUnSeenMessages)
            // Update the counts
            document.getElementById('openCasesCount').textContent = numberOfOpenCases || 0;
            document.getElementById('pendingCasesCount').textContent = numberOfPendingCases || 0;
            document.getElementById('closedCasesCount').textContent = numberOfClosedCases || 0;

            // Show or hide the "New" badge on the Open Cases button
            const openCasesIndicator = document.querySelector('#openCasesBtn .new-case-indicator');
            if (numberOfOpenCases > 0) {
                openCasesIndicator.style.display = 'inline';
            } else {
                openCasesIndicator.style.display = 'none';
            }

            // Show or hide the "New" badge on the Pending Cases button
            const pendingCasesIndicator = document.querySelector('#pendingCasesBtn .new-case-indicator');
            if (pendingCasesWithUnSeenMessages > 0) {
                pendingCasesIndicator.style.display = 'inline';
            } else {
                pendingCasesIndicator.style.display = 'none';
            }
        })
        .catch(error => {
            handleErrors(error);
        });
});

// Event listeners for buttons
document.getElementById('openCasesBtn').addEventListener('click', function () {
   window.location.replace('/admin/customerSupport/openCases')
});

document.getElementById('pendingCasesBtn').addEventListener('click', function () {
    window.location.replace('/admin/customerSupport/pendingCases')
});

document.getElementById('closedCasesBtn').addEventListener('click', function () {
    window.location.replace('/admin/customerSupport/closedCases')
});
