// Confirm Activation and Call Activation Function
function confirmActivation() {
    const confirmation = confirm("Are you sure you want to activate this Ticket Card?");
    if (confirmation) {
        activateTicketCard();
    }
}

// Activation Function
function activateTicketCard() {
    alert("Ticket Card activated successfully!");
    document.getElementById("ticket-status").textContent = "Activated";
}

// Show User List Based on Status
function showList(status) {
    const lists = document.querySelectorAll(".user-list");
    lists.forEach(list => list.style.display = "none"); // Hide all lists
    document.getElementById(status).style.display = "block"; // Show selected list
}
