// Function to populate the table with user activity data
function populateActivityTable(activities) {
  const tableBody = document.getElementById("transaction-table");
  tableBody.innerHTML = ""; // Clear any previous data

  activities.forEach((activity, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${new Date(activity.createdAt).toLocaleDateString()}</td>
        <td>${new Date(activity.createdAt).toLocaleTimeString()}</td>
        <td>${activity.activityType}</td>
        <td>${activity.activityDescription || "N/A"}</td>
        <td>${activity.ipAddress || "N/A"}</td>
        <td>${activity.location || "N/A"}</td>
        <td>${activity.deviceType || "N/A"}</td>
      `;

    tableBody.appendChild(row);
  });
}

// Function to fetch user activity
async function fetchUserActivity(filters = {}) {
  try {
    // Make API request using postRequestWithToken
    const response = await postRequestWithToken(
      "user/piggyBox/userActivity/post/getUserActivity",
      filters
    );

    const activities = response.data.data;
    populateActivityTable(activities);
  } catch (error) {
    // Handle errors using handleErrors
    handleErrors(error, mapFunction);
  }
}

// Function to get filter values from the form
function getFilters() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  const limit = document.getElementById("limit").value;
  const activityType = document.getElementById("type").value;

  const filters = {};

  // Only add the filter if the value exists
  if (fromDate) filters.fromDate = fromDate;
  if (toDate) filters.toDate = toDate;
  if (limit) filters.limit = limit;
  if (activityType !== "all") filters.activityType = activityType;

  return filters;
}

// Event listener for DOMContentLoaded (initial page load)
document.addEventListener("DOMContentLoaded", () => {
  // Fetch activity without any filters when the page loads
  fetchUserActivity();
});

// Event listener for "Get Activity" button
document.getElementById("btnFetchActivity").addEventListener("click", () => {
  const filters = getFilters();
  fetchUserActivity(filters); // Fetch with filters
});
