// Dummy list of closed case information
const closedCases = [
    { UserId: 301, caseId: 'CL001', name: 'George Hall', email: 'george.hall@example.com', isExistingUser: true, creationTime: '2024-09-04 08:00 AM', closedBy: 'admin', closedTime: '2024-09-06 02:00 PM' },
    { UserId: 302, caseId: 'CL002', name: 'Emma Scott', email: 'emma.scott@example.com', isExistingUser: false, creationTime: '2024-09-04 08:30 AM', closedBy: 'user', closedTime: '2024-09-06 02:30 PM' },
    { UserId: 303, caseId: 'CL003', name: 'Henry Adams', email: 'henry.adams@example.com', isExistingUser: true, creationTime: '2024-09-04 09:00 AM', closedBy: 'admin', closedTime: '2024-09-06 03:00 PM' },
    { UserId: 304, caseId: 'CL004', name: 'Olivia Martinez', email: 'olivia.martinez@example.com', isExistingUser: false, creationTime: '2024-09-04 09:45 AM', closedBy: 'user', closedTime: '2024-09-06 03:45 PM' },
    { UserId: 305, caseId: 'CL005', name: 'Liam Parker', email: 'liam.parker@example.com', isExistingUser: true, creationTime: '2024-09-04 10:15 AM', closedBy: 'admin', closedTime: '2024-09-06 04:15 PM' }
];

// Display the number of closed cases
document.getElementById('closedCasesCount').textContent = closedCases.length;

// Populate the table with closed case data
const closedCaseListBody = document.getElementById('closedCaseListBody');
closedCases.forEach(caseInfo => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${caseInfo.UserId}</td>
        <td>${caseInfo.caseId}</td>
        <td>${caseInfo.name}</td>
        <td>${caseInfo.email}</td>
        <td>${caseInfo.isExistingUser ? 'Yes' : 'No'}</td>
        <td>${caseInfo.creationTime}</td>
        <td>${caseInfo.closedBy}</td>
        <td>${caseInfo.closedTime}</td>
        <td><button class="btn btn-secondary btn-sm open-case-btn">Open</button></td>
    `;
    closedCaseListBody.appendChild(row);
});

// Event listener for the "Open" action buttons
document.querySelectorAll('.open-case-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Add logic to handle opening the closed case
        console.log('Closed Case opened:', this.closest('tr').querySelector('td:nth-child(2)').textContent);
    });
});
