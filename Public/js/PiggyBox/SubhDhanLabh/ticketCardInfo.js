// Fetch data on DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
  const url = window.location.href;
  const ticketTitle = url.split("/").pop();
  try {
    const data = await fetchTicketData(ticketTitle);

    populateTicketData(data);
  } catch (error) {
    handleErrors(error);
  }
});

// Fetch ticket data from API
async function fetchTicketData(ticketTitle) {
  const url = "user/subhDhanLabh/post/getUserTicketReferral";
  const obj = { ticketTitle: ticketTitle };
  return await postRequestWithToken(url, obj);
}

// Populate ticket and user data into the HTML
function populateTicketData(data) {
  data = data.data;
  document.getElementById(
    "ticket-title"
  ).textContent = `Ticket: ${data.ticketCard.title}`;
  document.getElementById("ticket-price").textContent = data.ticketCard.price;
  document.getElementById("ticket-status").textContent = data.userTicketCard
    .isTicketActive
    ? "Active"
    : "Inactive";
  document.getElementById("piggybox-balance").textContent =
    data.piggyBalance || 0;
  document.getElementById("affiliated-bonus").textContent =
    data.userTicketCard.affiliateBonus || 0;
  document.getElementById("gold-bonus").textContent = "N/A";

  populateUserList(data.usersLists.notActivatedUsers, "initiated-users-list");
  populateUserList(
    data.usersLists.activeButNotCompletedUsers,
    "pending-users-list"
  );
  populateUserList(data.usersLists.completedUsers, "completed-users-list");
}

// Populate user list based on the status
function populateUserList(users, listId) {
  const list = document.getElementById(listId);
  list.innerHTML = users
    .map(
      (user) => `<li>Customer ID: ${user.candidateId} | Name: ${user.name}</li>`
    )
    .join("");
}

// Confirm Activation and Call Activation Function
function confirmActivation() {
  const confirmation = confirm(
    "Are you sure you want to activate this Ticket Card?"
  );
  if (confirmation) {
    activateTicketCard();
  }
}

async function activateTicketCard() {
  const url = window.location.href;
  const ticketTitle = url.split("/").pop();
  const apiUrl = "user/subhDhanLabh/post/activateTicketCard";

  try {
    const response = await postRequestWithToken(apiUrl, { ticketTitle });

    window.location.reload();
  } catch (error) {
    handleErrors(error);
  }
}
// Show User List Based on Status
function showList(status) {
  const lists = document.querySelectorAll(".user-list");
  lists.forEach((list) => (list.style.display = "none")); // Hide all lists
  document.getElementById(status).style.display = "block"; // Show selected list
}
