// Dummy list of case information
const cases = [
    { UserId: 101, caseId: 'C001', name: 'John Doe', email: 'john.doe@example.com', isExistingUser: true, creationTime: '2024-09-05 10:00 AM' },
    { UserId: 102, caseId: 'C002', name: 'Jane Smith', email: 'jane.smith@example.com', isExistingUser: false, creationTime: '2024-09-05 11:30 AM' },
    { UserId: 103, caseId: 'C003', name: 'Robert Johnson', email: 'robert.johnson@example.com', isExistingUser: true, creationTime: '2024-09-05 01:45 PM' },
    { UserId: 104, caseId: 'C004', name: 'Emily White', email: 'emily.white@example.com', isExistingUser: false, creationTime: '2024-09-05 03:10 PM' },
    { UserId: 105, caseId: 'C005', name: 'Michael Brown', email: 'michael.brown@example.com', isExistingUser: true, creationTime: '2024-09-05 04:30 PM' }
];

// Display the number of cases
document.getElementById('totalCasesCount').textContent = cases.length;

// Populate the table with case data
const caseListBody = document.getElementById('caseListBody');
cases.forEach(caseInfo => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${caseInfo.UserId}</td>
        <td>${caseInfo.caseId}</td>
        <td>${caseInfo.name}</td>
        <td>${caseInfo.email}</td>
        <td>${caseInfo.isExistingUser ? 'Yes' : 'No'}</td>
        <td>${caseInfo.creationTime}</td>
        <td><button class="btn btn-primary btn-sm open-case-btn">Open</button></td>
    `;
    caseListBody.appendChild(row);
});

// Event listener for the "Open" action buttons
document.querySelectorAll('.open-case-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Add logic to handle opening the case
        console.log('Case opened:', this.closest('tr').querySelector('td:nth-child(2)').textContent);
    });
});
