document.addEventListener("DOMContentLoaded", async () => {
  // Fetch and display the customer list when the page loads
  await fetchCustomerList();

  // Event listener for search button
  document.getElementById("search-btn").addEventListener("click", async () => {
    const customerId = document.getElementById("customer-id").value;
    if (customerId) {
      await fetchCustomerSearch(customerId);
    } else {
      alert("Please enter a Customer ID.");
    }
  });

  // Event listener for Get Result button
  document
    .getElementById("get-result-btn")
    .addEventListener("click", async () => {
      const fromDate = document.getElementById("fromDate").value;
      const toDate = document.getElementById("toDate").value;
      const limit = document.getElementById("limit").value;

      await fetchCustomerResults(fromDate, toDate, limit);
    });
});

// Function to fetch the customer list
async function fetchCustomerList() {
  try {
    let response = await postRequestWithToken(
      "admin/piggyBox/post/customerList"
    );
    response = response.data;
    displayCustomerList(response.customers);
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}

// Function to display the customer list in the table
function displayCustomerList(customers) {
  const tableBody = document.getElementById("members-table-body");
  tableBody.innerHTML = ""; // Clear previous entries

  customers.forEach((customer, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <th scope="row">${index + 1}</th>
        <td>${customer.candidateId}</td>
        <td>${customer.name}</td>
        <td>${new Date(customer.createdAt).toLocaleDateString()}</td>
        <td>${getTimeFromTimeData(new Date(customer.createdAt))}</td>
        <td><a href='/admin/piggyBox/manageFunds/${
          customer.candidateId
        }'>Manage Funds</a></td>
      `;
    tableBody.appendChild(row);
  });
}

// Function to search for a customer by ID
async function fetchCustomerSearch(customerId) {
  try {
    let response = await postRequestWithToken(
      "admin/piggyBox/post/customerSearch",
      { candidateId: customerId }
    );
    response = response.data;
    displayCustomerList(response.users); // Reusing display function
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}

// Function to get customer results based on date range and limit
async function fetchCustomerResults(fromDate, toDate, limit) {
  try {
    let response = await postRequestWithToken(
      "admin/piggyBox/post/customerList",
      { fromDate, toDate, limit }
    );
    response = response.data;

    displayCustomerList(response.customers); // Reusing display function
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}
