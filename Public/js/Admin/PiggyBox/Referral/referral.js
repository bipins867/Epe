document.addEventListener("DOMContentLoaded", async () => {
    // Fetch and display the customer list when the DOM content is loaded
    await loadCustomerList();
  
    // Set up the search button click event
    const searchButton = document.querySelector(".search-btn");
    searchButton.addEventListener("click", async () => {
      const candidateId = document.getElementById("customer-id").value;
      await searchCustomerList(candidateId);
    });
  });
  
  // Function to load the customer list
  async function loadCustomerList() {
    try {
      const response = await postRequestWithToken('admin/piggyBox/referral/post/customerList');
      if (response) {
        const membersTableBody = document.getElementById("members-table-body");
        membersTableBody.innerHTML = ""; // Clear the table body
  
        // Populate the table with retrieved users
        response.data.data.forEach((user, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.candidateId}</td>
            <td>${user.name}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td><a href="/admin/piggyBox/referral/customerPanel/${user.candidateId}">View</a></td>
          `;
          membersTableBody.appendChild(row);
        });
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Error loading customer list:", error);
      alert("Failed to load customer list.");
    }
  }
  
  // Function to search for a customer based on candidateId
  async function searchCustomerList(candidateId) {
    if (!candidateId) {
      alert("Please enter a Customer ID.");
      return;
    }
  
    try {
      const response = await postRequestWithToken('admin/piggyBox/referral/post/searchedCustomerList', { candidateId });
      if (response) {
        const membersTableBody = document.getElementById("members-table-body");
        membersTableBody.innerHTML = ""; // Clear the table body
  
        // Populate the table with searched user
        const user = response.data.data[0]; // Assuming the response returns an array with one user
        if (user) {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>1</td>
            <td>${user.candidateId}</td>
            <td>${user.name}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td><a href="/admin/piggyBox/referral/customerPanel/${user.candidateId}">View</a></td>
         
          `;
          membersTableBody.appendChild(row);
        } else {
          alert("No user found with that Customer ID.");
        }
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      alert("Failed to search customer.");
    }
  }
  
  // Function to extract candidateId from URL
  function getCandidateIdFromUrl() {
    const urlSegments = window.location.pathname.split("/");
    return urlSegments[urlSegments.length - 1]; // Get the last segment which is the candidateId
  }
  