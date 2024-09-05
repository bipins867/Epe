// Dummy list of pending case information
const pendingCases = [
    { UserId: 201, caseId: 'P001', name: 'Alice Johnson', email: 'alice.johnson@example.com', isExistingUser: true, creationTime: '2024-09-06 09:00 AM' },
    { UserId: 202, caseId: 'P002', name: 'Bob Williams', email: 'bob.williams@example.com', isExistingUser: false, creationTime: '2024-09-06 09:30 AM' },
    { UserId: 203, caseId: 'P003', name: 'Charlie Davis', email: 'charlie.davis@example.com', isExistingUser: true, creationTime: '2024-09-06 10:00 AM' },
    { UserId: 204, caseId: 'P004', name: 'Diana Moore', email: 'diana.moore@example.com', isExistingUser: false, creationTime: '2024-09-06 10:45 AM' },
    { UserId: 205, caseId: 'P005', name: 'Ethan Taylor', email: 'ethan.taylor@example.com', isExistingUser: true, creationTime: '2024-09-06 11:15 AM' }
];

// Display the number of pending cases
document.getElementById('pendingCasesCount').textContent = pendingCases.length;

// Populate the table with pending case data
const pendingCaseListBody = document.getElementById('pendingCaseListBody');
pendingCases.forEach(caseInfo => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${caseInfo.UserId}</td>
        <td>${caseInfo.caseId}</td>
        <td>${caseInfo.name}</td>
        <td>${caseInfo.email}</td>
        <td>${caseInfo.isExistingUser ? 'Yes' : 'No'}</td>
        <td>${caseInfo.creationTime}</td>
        <td>
            <button class="btn btn-warning btn-sm position-relative open-case-btn">
                Open
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    New
                </span>
            </button>
        </td>
    `;
    pendingCaseListBody.appendChild(row);
});

// Event listener for the "Open" action buttons
document.querySelectorAll('.open-case-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Add logic to handle opening the case
        console.log('Pending Case opened:', this.closest('tr').querySelector('td:nth-child(2)').textContent);
    });
});
