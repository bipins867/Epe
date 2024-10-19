document.addEventListener("DOMContentLoaded", () => {
    // Fetch the pending list on page load
    fetchPendingList();
  
    // Add event listener to the search button
    document.querySelector(".search-btn").addEventListener("click", () => {
      const customerId = document.getElementById("customer-id").value.trim();
      if (customerId) {
        searchCustomerById(customerId);
      } else {
        alert("Please enter a Customer ID.");
      }
    });
  });
  
  // Function to fetch the pending list and display it in the table
  function fetchPendingList() {
    const url = "admin/piggyBox/accountClouser/post/previousList";
    const payload = {}; // Include any necessary payload for the API
  
    postRequestWithToken(url, payload)
      .then((response) => {
        // Assuming the response contains a list of customers
        const membersTableBody = document.getElementById("members-table-body");
        membersTableBody.innerHTML = ""; // Clear previous data
  
        response.data.users.forEach((customer, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${index + 1}</td>
              <td>${customer.candidateId}</td>
              <td>${customer.name}</td>
               <td>${new Date(customer.createdAt).toLocaleDateString()}</td>
               <td>${getTimeFromTimeData(new Date(customer.createdAt))}</td>
              <td><a href="/admin/piggyBox/accountClouser/customerPanel/${
                customer.candidateId
              }">View</a></td>
            `;
          membersTableBody.appendChild(row);
        });
      })
      .catch((error) => {
        handleErrors(error,mapFunction);
      });
  }
  
  // Function to search customer by ID
  function searchCustomerById(customerId) {
    const url = "admin/piggyBox/accountClouser/post/previousList"; // Adjust the endpoint if necessary
    const payload = { candidateId: customerId }; // Include the customer ID in the payload
  
    postRequestWithToken(url, payload)
      .then((response) => {
        // Assuming the response contains a list of customers
        const membersTableBody = document.getElementById("members-table-body");
        membersTableBody.innerHTML = ""; // Clear previous data
  
        response.data.users.forEach((customer, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${index + 1}</td>
              <td>${customer.candidateId}</td>
              <td>${customer.name}</td>
               <td>${new Date(customer.createdAt).toLocaleDateString()}</td>
              <td><a href="/admin/piggyBox/accountClouser/customerPanel/${
                customer.candidateId
              }">View</a></td>
            `;
          membersTableBody.appendChild(row);
        });
      })
      .catch((error) => {
        handleErrors(error,mapFunction);
      });
  }
  