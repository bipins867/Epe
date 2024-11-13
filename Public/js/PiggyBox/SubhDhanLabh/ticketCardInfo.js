// Fetch data on DOMContentLoaded

function setBackgroundColor () {
  // Get the ticket info and title elements
  const ticketInfo = document.getElementById("ticket-info");
  const ticketTitle = document
    .getElementById("ticket-title")
    .innerText.toLowerCase(); // Convert to lowercase
  console.log(ticketTitle)
  // Function to set background color based on ticket title
  function setTicketBackground() {
    switch (ticketTitle) {
      case "bronze pool":
        ticketInfo.style.backgroundColor = "#cd7f32"; // Bronze color
        break;
      case "silver pool":
        ticketInfo.style.backgroundColor = "#c0c0c0"; // Silver color
        break;
      case "gold pool":
        ticketInfo.style.backgroundColor = "#ffd700"; // Gold color
        break;
      case "diamond pool":
        ticketInfo.style.backgroundColor = "#b9f2ff"; // Diamond color
        break;
      case "platinum pool":
        ticketInfo.style.backgroundColor = "#e5e4e2"; // Platinum color
        break;
      default:
        ticketInfo.style.backgroundColor = "#ffffff"; // Default color
    }
  }

  // Call the function to set the background color
  setTicketBackground();
}
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
  ).textContent = `${data.ticketCard.title} POOL`;
  document.getElementById("ticket-price").textContent = parseFloat(data.ticketCard.price).toFixed(2);
  document.getElementById("ticket-status").textContent = userTicketCard
    ? userTicketCard.isTicketActive
      ? "Active"
      : "Inactive"
    : "Inactive";
  if(userTicketCard){
    if(userTicketCard.isTicketActive){
      document.getElementById('activate-button').disabled=true;
    }
  }
  document.getElementById("piggybox-balance").textContent =
    data.piggyBalance.toFixed(2) || 0;
  document.getElementById("affiliated-bonus").textContent = userTicketCard
    ? userTicketCard.affiliateBonus.toFixed(2)
    : 0;
  document.getElementById("gold-bonus").textContent = "N/A";

  populateUserList(usersList, "users-list");
  setBackgroundColor();
}

// Populate user list based on the status
function populateUserList(users) {
  const tableBody = document.getElementById("referralTableBody");

  if (!users || users.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No data available in table</td></tr>`;
    return;
  }

  tableBody.innerHTML = users
    .map((user, index) => {
      const userTicketCard = user.userTicketCard;
      const rechargeCount = userTicketCard ? userTicketCard.rechargeCount : 0;
      const completedCount = userTicketCard
        ? rechargeCount - userTicketCard.completedCount
        : 0;

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${user.candidateId}</td>
          <td>${user.name}</td>
          <td>${rechargeCount}</td>
          <td>${completedCount}</td>
        </tr>
      `;
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
