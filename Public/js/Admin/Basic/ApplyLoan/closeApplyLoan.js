// Function to fetch and display closed Apply Loan details
async function fetchClosedApplyLoanDetails() {
    try {
      // Get the ID from the URL
      const urlParts = window.location.pathname.split('/');
      const id = urlParts[urlParts.length - 1];
  
      // Make the API call to fetch closed loan details
      const result = await postRequestWithToken(`admin/basic/applyLoan/post/applyLoanInfo/${id}`);
  
      // Assuming the API response returns an object with loan details
      const loan = result.data;
  
      // Update the DOM with loan details
      document.getElementById('name').textContent = loan.name;
      document.getElementById('email').textContent = loan.email;
      document.getElementById('phoneNumber').textContent = loan.phoneNumber;
      document.getElementById('loanType').textContent = loan.loanType;
      document.getElementById('reasonForLoan').textContent = loan.reasonForLoan;
      document.getElementById('statusChecked').textContent = loan.statusChecked ? 'Yes' : 'No';
      document.getElementById('adminId').textContent = loan.adminId;
      document.getElementById('adminRemark').textContent = loan.adminRemark || 'N/A';
    } catch (error) {
      handleErrors(error, 'fetchClosedApplyLoanDetails');
    }
  }
  
  // Fetch the closed loan details when the DOM content is fully loaded
  document.addEventListener('DOMContentLoaded', fetchClosedApplyLoanDetails);
  