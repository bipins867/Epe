const users = [
    { userId: "001", name: "John Doe", email: "johndoe@example.com", panNumber: "ABCDE1234F" },
    { userId: "002", name: "Jane Smith", email: "janesmith@example.com", panNumber: "FGHIJ5678K" },
    { userId: "003", name: "Mike Johnson", email: "mikej@example.com", panNumber: "KLMNO9876P" },
    { userId: "004", name: "Emily Davis", email: "emilyd@example.com", panNumber: "QRSTU4321V" },
    { userId: "005", name: "Robert Brown", email: "robertb@example.com", panNumber: "WXYZ5432B" },
    { userId: "006", name: "Linda Williams", email: "lindaw@example.com", panNumber: "CDEFG6789H" },
    { userId: "007", name: "Michael Miller", email: "michaelm@example.com", panNumber: "HIJKL0987T" },
    { userId: "008", name: "Sarah Wilson", email: "sarahw@example.com", panNumber: "MNOPQ4321Z" },
    { userId: "009", name: "David Moore", email: "davidm@example.com", panNumber: "RSTUV6789X" },
    { userId: "010", name: "Jessica Taylor", email: "jessicat@example.com", panNumber: "UVWXY1234Q" }
];

// Function to create a table row for each user
function populateUserTable() {
    const userTableBody = document.getElementById('userTableBody');
    users.forEach(user => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${user.userId}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.panNumber}</td>
            <td><a href="#" class="btn btn-primary btn-sm" onclick="viewKYCDetails('${user.userId}')">View KYC</a></td>
        `;

        userTableBody.appendChild(row);
    });
}

// Function to handle the "View KYC" button click (for now, it just logs the userId)
function viewKYCDetails(userId) {
    alert('Viewing KYC details for user ID: ' + userId);
    // In a real application, you'd navigate to a detailed page or load data via AJAX.
}

// Populate the table when the page loads
document.addEventListener('DOMContentLoaded', populateUserTable);