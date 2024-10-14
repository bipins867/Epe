document.addEventListener("DOMContentLoaded", async function () {
  try {
    console.log("What it is doing");
    const result = await getRequestWithToken("admin/dashboardInfo");
    console.log(result);
    const adminInfo = result.data.adminInfo;

    const userName = adminInfo.userName;
    console.log(userName);
    // This would be dynamically set in a real application
    //document.getElementById("userId").textContent = `UserName: ${userName}`;

    // Handle Logout Button
    document.getElementById("logoutBtn").addEventListener("click", function () {
      // Handle logout logic here, e.g., clear session and redirect to login page
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login"; // Redirect to login page
    });
  } catch (err) {
    console.log(err);
    handleErrors(err, mapFunction);
  }

  // updateChart();
  // Display User ID

  // Handle List Item Clicks
  // document
  //   .getElementById("adminOptions")
  //   .addEventListener("click", function (event) {
  //     if (event.target && event.target.nodeName === "LI") {
  //       const selectedOption = event.target.textContent;
  //       console.log(`${selectedOption} selected`);

  //       // Update content area based on the selected option
  //       const contentArea = document.getElementById("contentArea");
  //       contentArea.innerHTML = `<h3>${selectedOption}</h3><p>Manage the ${selectedOption} settings here.</p>`;
  //     }
  //   });
});

function updateChart() {
  // Sample data for the chart
  let ctx = document.getElementById("memberChart").getContext("2d");
  let memberChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "1 Oct 2024",
        "2 Oct 2024",
        "3 Oct 2024",
        "4 Oct 2024",
        "5 Oct 2024",
        "6 Oct 2024",
        "7 Oct 2024",
      ],
      datasets: [
        {
          label: "Join Member",
          data: [1, 2, 3, 2, 4, 3, 1],
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
