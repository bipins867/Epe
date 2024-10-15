document.addEventListener("DOMContentLoaded", async () => {
    try {
   
      // API request to fetch the withdrawal list based on status
      const withdrawalListEndpoint = `admin/piggyBox/requestWithdrawal/post/withdrawalList`;
  
      // Post request to get withdrawal list
      let withdrawalResponse = await postRequestWithToken(
        withdrawalListEndpoint,
       
      );
  
      withdrawalResponse = withdrawalResponse.data;
      // Check if the request was successful
      if (withdrawalResponse && withdrawalResponse.success) {
        const withdrawalRequests = withdrawalResponse.data;
  
        // Get the table body element
        const tableBody = document.getElementById("members-table-body");
  
        // Clear the table body first
        tableBody.innerHTML = "";
  
        // Loop through the withdrawal requests and insert rows into the table
        withdrawalRequests.forEach((request, index) => {
          const row = document.createElement("tr");
  
          // Create table cells for each piece of data
          row.innerHTML = `
              <td>${index + 1}</td>
              <td>${request.User.candidateId}</td>
              <td>${request.User.name}</td>
              <td>${new Date(request.createdAt).toLocaleDateString()}</td>
              <td><a href="/admin/piggyBox/requestWithdrawal/customerPanel/${
                request.User.candidateId
              }">View Details</a></td>
            `;
  
          // Append the row to the table body
          tableBody.appendChild(row);
        });
      } else {
        console.error(
          "Error fetching withdrawal list",
          withdrawalResponse.message
        );
      }
    } catch (error) {
      handleErrors(error,mapFunction);
    }
  });
  