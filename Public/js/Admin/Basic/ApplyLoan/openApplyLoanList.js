
// Function to fetch and display pending ApplyLoan applications
async function fetchPendingApplyLoans() {
  try {
    // Make the API call to fetch pending loan applications
    const result = await postRequestWithToken('admin/basic/applyLoan/post/getPendingList');

    // Assuming the API response is an array of loan applications
    const loans = result.data;

    // Get the tbody element where loan data will be inserted
    const loanListBody = document.getElementById('loanListBody');
    
    // Clear existing rows
    loanListBody.innerHTML = '';

    // Iterate over the loans and create rows dynamically
    loans.forEach((loan) => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${loan.id}</td>
        <td>${loan.name}</td>
        <td>${loan.email}</td>
        <td>${loan.loanType}</td>
        <td>${loan.statusChecked ? 'Yes' : 'No'}</td>
        <td>
          <a class="btn btn-primary btn-sm" href="pendingApplyLoan/${loan.id}">View</a>
        </td>
      `;
      
      // Append the new row to the table body
      loanListBody.appendChild(row);
    });
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}

// Fetch the loan applications when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', fetchPendingApplyLoans);
