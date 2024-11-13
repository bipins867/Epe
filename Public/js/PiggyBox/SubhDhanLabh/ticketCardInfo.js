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
  const userTicketCard = data.userTicketCard;
  const usersList = data.usersLists;
  document.getElementById(
    "ticket-title"
  ).textContent = `Ticket: ${data.ticketCard.title}`;
  document.getElementById("ticket-price").textContent = data.ticketCard.price;
  document.getElementById("ticket-status").textContent = userTicketCard
    ? userTicketCard.isTicketActive
      ? "Active"
      : "Inactive"
    : "Inactive";
  document.getElementById("piggybox-balance").textContent =
    data.piggyBalance || 0;
  document.getElementById("affiliated-bonus").textContent = userTicketCard
    ? userTicketCard.affiliateBonus
    : 0;
  document.getElementById("gold-bonus").textContent = "N/A";

  populateUserList(usersList, "users-list");
}

// Populate user list based on the status
function populateUserList(users, listId) {
  const list = document.getElementById(listId);
  list.innerHTML = users
    .map((user) => {
      const userTicketCard = user.userTicketCard;

      let rechargeCount = 0;
      let completedCount = 0;

      if (userTicketCard) {
        rechargeCount = userTicketCard.rechargeCount;
        completedCount = rechargeCount - userTicketCard.completedCount;
      }

      return `<li>Customer ID: ${user.candidateId} | Name: ${user.name}   | Pool purchase count: ${rechargeCount} | Pending Purchanse Count: ${completedCount}</li> `;
    })
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
