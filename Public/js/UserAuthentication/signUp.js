document.getElementById('registrationForm').addEventListener('submit', function(event) {
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var passwordHelp = document.getElementById('passwordHelp');

    if (password !== confirmPassword) {
        event.preventDefault(); // Prevent form submission
        passwordHelp.textContent = "Passwords do not match!";
        passwordHelp.style.color = "red";
    } else {
        passwordHelp.textContent = "";
    }
});