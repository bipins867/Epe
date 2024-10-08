// Function to create a table row for each user
async function populateUserTable() {
  try {
    const result = await getRequestWithToken("admin/kyc/post/pendingKycs");
    const users = result.data.pendingKycList;
    const userTableBody = document.getElementById("userTableBody");
    
    users.forEach((user) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.aadharNumber}</td>
                <td>${user.panNumber}</td>
                <td>${user.dob}</td>
                <td>${user.status}</td>
                <td><a href="/admin/kyc/dashboard/${user.User.phone}" class="btn btn-primary btn-sm">View KYC</a></td>
            `;

      userTableBody.appendChild(row);
    });
  } catch (err) {
    handleErrors(err,mapFunction);
  }
}

// Populate the table when the page loads
document.addEventListener("DOMContentLoaded", populateUserTable);
