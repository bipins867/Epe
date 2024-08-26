document.getElementById('kycForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    // Retrieve form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const dob = document.getElementById('dob').value;
    const userImage = document.getElementById('userImage').files[0];
    const aadharNumber = document.getElementById('aadharNumber').value;
    const aadharFront = document.getElementById('aadharFront').files[0];
    const aadharBack = document.getElementById('aadharBack').files[0];
    const panNumber = document.getElementById('panNumber').value;
    const panFile = document.getElementById('panFile').files[0];

    // Basic validation example (you can expand this as needed)
    if (name && email && phone && dob && userImage && aadharNumber && aadharFront && aadharBack && panNumber && panFile) {
        alert('KYC form submitted successfully!');
        // You can add logic to handle the form data, such as sending it to a server
    } else {
        alert('Please fill out all fields and upload all required files.');
    }
});