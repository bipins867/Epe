

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    // Retrieve form data
    const userId = document.getElementById('userId').value;
    const userType = document.getElementById('userType').value;
    const password = document.getElementById('password').value;

    // Simple validation (you can expand this as needed)
    if (userId && userType && password) {
        alert('Login successful!\nUser ID: ' + userId + '\nUser Type: ' + userType);
    } else {
        alert('Please fill out all fields.');
    }
});
