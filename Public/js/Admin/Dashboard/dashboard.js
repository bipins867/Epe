document.addEventListener("DOMContentLoaded", async function () {
  try {
    const result = await getRequestWithToken("admin/dashboardInfo");

    if (result) {
      const data = result.data.dashboardInfo;
      console.log(data);
      // Total Customers
      document.querySelector(".total-customers .h5").textContent =
        data.totalCustomers;

      // Today's Joined Customers
      document.querySelector(".todays-join-customers .h5").textContent =
        data.todaysJoinCustomers.length;

      // Wallet Recharge Today
      document.querySelector(".wallet-recharge-today .h5").textContent =
        data.walletRechargeToday.toFixed(2);

      // Total Piggy Balance
      document.querySelector(".total-piggy-balance .h5").textContent =
        data.totalWalletBalance.toFixed(2);

      // Total Uncleared Piggy Balance
      document.querySelector(".total-uncleared-balance .h5").textContent =
        data.totalUnclearedBalance.toFixed(2);

      // Total Interest Balance
      document.querySelector(".total-interest-balance .h5").textContent =
        data.totalInterestBalance.toFixed(2);

      // Pending Withdrawal Requests
      document.querySelector(".pending-withdrawal-requests .h5").textContent =
        data.pendingWithdrawals.length;

      // Pending Account Closure Requests
      document.querySelector(".pending-acc-closure-requests .h5").textContent =
        data.pendingAccountClosureRequests.length;

      // Recent Joined Members
      const membersTableBody = document.getElementById("members-table-body");
      membersTableBody.innerHTML = ""; // Clear existing data
      data.recentJoinedUsers.forEach((user, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${user.candidateId}</td>
            <td>${user.name}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>${getTimeFromTimeData(new Date(user.createdAt))}</td>
          </tr>
        `;
        membersTableBody.innerHTML += row;
      });
    }

    loadSliderAnnouncements();
    document.getElementById("logoutBtn").addEventListener("click", function () {
      // Handle logout logic here, e.g., clear session and redirect to login page
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login"; // Redirect to login page
    });
  } catch (err) {
    console.log(err);
    handleErrors(err, mapFunction);
  }
});


const loadSliderAnnouncements = async () => {
  try {
    const result2 = await postRequestWithToken(
      "basic/post/getAllActiveAnnouncments",
      {}
    );

    const announcement2 = result2.data.data;
    updateSlider(announcement2);
  } catch (error) {
    handleErrors(error);
  }
};

const updateSlider = (announcements) => {
  const wrapper = document.getElementById("announcement-wrapper");
  wrapper.innerHTML = ""; // Clear previous announcements

  // Create a string to hold all announcement messages with separation
  const announcementMessages = announcements
    .map((announcement) => announcement.message)
    .join(" | ");

  // Create a new element to hold the messages
  const messageDiv = document.createElement("b");
  messageDiv.className = "announcement-message";
  messageDiv.innerText = announcementMessages; // Set the concatenated message

  // Append the messageDiv to the wrapper
  wrapper.appendChild(messageDiv);
};