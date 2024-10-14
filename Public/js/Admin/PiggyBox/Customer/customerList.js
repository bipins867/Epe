document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch and display the customer list on page load
    const result = await postRequestWithToken(
      "admin/piggyBox/customer/post/customerList",
      {}
    );
    updateCustomerTable(result.data.customers);
  } catch (error) {
    handleErrors(error)
  }
});

// Event listener for search button click
document.getElementById("search-btn").addEventListener("click", async () => {
  const candidateId = document.getElementById("candidateId").value;

  if (!candidateId) {
    alert("Please enter a valid Customer ID.");
    return;
  }

  try {
    // Search customer by candidateId
    const result = await postRequestWithToken(
      "admin/piggyBox/customer/post/customerSearch",
      { candidateId }
    );
    updateCustomerTable(result.data.users);
  } catch (error) {
    handleErrors(error)
  }
});

// Event listener for Get Result button click
document
  .querySelector(".btn.btn-primary")
  .addEventListener("click", async () => {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const limit = document.getElementById("limit").value;

    const requestBody = {
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    try {
      // Fetch customer list with date range and limit
      const result = await postRequestWithToken(
        "admin/piggyBox/customer/post/customerList",
        requestBody
      );

      updateCustomerTable(result.data.customers);
    } catch (error) {
     handleErrors(error)
    }
  });

// Function to update the table with customer data
function updateCustomerTable(customers) {
  const tableBody = document.getElementById("members-table-body");
  tableBody.innerHTML = ""; // Clear existing data

  customers.forEach((customer, index) => {
    const row = `
          <tr>
            <th scope="row">${index + 1}</th>
            <td>${customer.candidateId}</td>
            <td>${customer.name}</td>
            <td>${new Date(customer.createdAt).toLocaleDateString()}</td>
            <td>
             <a class="btn btn-primary" href="/admin/piggyBox/customer/editCustomer/${
               customer.candidateId
             }">Edit</a>
            </td>
          </tr>
        `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}



