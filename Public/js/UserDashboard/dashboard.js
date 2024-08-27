// document.addEventListener("DOMContentLoaded", function() {
//     // Example user data
//     const user = {
//         name: "John Doe",
//         kycCompleted: false // Change this to true if KYC is completed
//     };

//     // Display user's name
//     const userNameElement = document.getElementById("userName");
//     userNameElement.textContent = `Welcome, ${user.name}!`;

//     // Show the appropriate KYC status bar
//     const kycCompletedElement = document.getElementById("kycCompleted");
//     const kycNotCompletedElement = document.getElementById("kycNotCompleted");

//     if (user.kycCompleted) {
//         kycCompletedElement.classList.remove("d-none");
//     } else {
//         kycNotCompletedElement.classList.remove("d-none");
//     }

//     // Button click handler to simulate KYC completion
//     const completeKycBtn = document.getElementById("completeKycBtn");
//     completeKycBtn.addEventListener("click", function() {
//         // Simulate KYC completion
//         user.kycCompleted = true;

//         // Update the status bar
//         kycNotCompletedElement.classList.add("d-none");
//         kycCompletedElement.classList.remove("d-none");
//     });
// });
