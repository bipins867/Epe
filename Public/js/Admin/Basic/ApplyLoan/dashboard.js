


// Function to update loan counts on the dashboard after DOM content is loaded
async function updateLoanCounts() {
  try {
    // Call the API to get counts for pending and closed loans
    const result = await postRequestWithToken('admin/basic/applyLoan/post/getCounts');

    // Assuming the API response returns { pendingCount, closedCount }
    const { pendingCount, closedCount } = result.data;

    // Update the counts in the DOM
    document.getElementById('openLoansCount').textContent = pendingCount;
    document.getElementById('closedLoansCount').textContent = closedCount;
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}

// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', updateLoanCounts);
