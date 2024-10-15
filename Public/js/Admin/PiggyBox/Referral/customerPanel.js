document.addEventListener("DOMContentLoaded", async () => {
  // Fetch and display the customer referral info when the DOM content is loaded
  const candidateId = getCandidateIdFromUrl(); // Get the candidate ID from the URL
  await loadCustomerReferralInfo(candidateId); // Load the referral info
});

// Function to load the customer referral information
async function loadCustomerReferralInfo(candidateId) {
  try {
    const response = await postRequestWithToken(
      "admin/piggyBox/referral/post/customerReferralInfo",
      { candidateId }
    );
    if (response) {
      const membersTableBody = document.getElementById("members-table-body");
      membersTableBody.innerHTML = ""; // Clear the table body

      // Populate the table with retrieved referral history
      const { referral, referredUsers } = response.data.data; // Destructure the response data

      document.getElementById("total-referral").innerText =
        referral.noOfReferrals;
      document.getElementById("pending-referral").innerText =
        referral.pendingReferrals;

      // If there are referred users, populate the table
      if (referredUsers && referredUsers.length > 0) {
        referredUsers.forEach((user, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${index + 1}</td>
              <td>${user.candidateId}</td>
              <td>${user.name}</td>
              <td>${user.status}</td>
              <td>${new Date(user.dateOfJoining).toLocaleDateString()}</td>
              <td>${
                user.dateOfCompletion
                  ? new Date(user.dateOfCompletion).toLocaleDateString()
                  : "N/A"
              }</td>
            `;
          membersTableBody.appendChild(row);
        });
      } else {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="6" class="text-center">No referred users found.</td>
          `;
        membersTableBody.appendChild(row);
      }
    } else {
      alert(response.message);
    }
  } catch (error) {
    handleErrors(error)
  }
}

// Function to extract candidateId from URL
function getCandidateIdFromUrl() {
  const urlSegments = window.location.pathname.split("/");
  return urlSegments[urlSegments.length - 1]; // Get the last segment which is the candidateId
}

//   // Function to search for a customer based on customerId
//   async function searchCustomerList(customerId) {
//     if (!customerId) {
//       alert("Please enter a Customer ID.");
//       return;
//     }

//     try {
//       const response = await postRequestWithToken('/admin/piggyBox/referral/post/searchedCustomerList', { customerId });
//       if (response.success) {
//         const membersTableBody = document.getElementById("members-table-body");
//         membersTableBody.innerHTML = ""; // Clear the table body

//         // Populate the table with searched user
//         const user = response.data[0]; // Assuming the response returns an array with one user
//         if (user) {
//           const row = document.createElement("tr");
//           row.innerHTML = `
//             <td>1</td>
//             <td>${user.customerId}</td>
//             <td>${user.customerName}</td>
//             <td>${user.status}</td>
//             <td>${new Date(user.dateJoining).toLocaleDateString()}</td>
//             <td>${user.dateOfCompletion ? new Date(user.dateOfCompletion).toLocaleDateString() : 'N/A'}</td>
//           `;
//           membersTableBody.appendChild(row);
//         } else {
//           alert("No user found with that Customer ID.");
//         }
//       } else {
//         alert(response.message);
//       }
//     } catch (error) {
//       console.error("Error searching customer:", error);
//       alert("Failed to search customer.");
//     }
//   }
