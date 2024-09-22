async function updateContactUsCounts() {
    try {
      // Call the API to get counts for pending and closed ContactUs requests
      const result = await postRequestWithToken('admin/basic/contactUs/post/getCounts');
  
      // Assuming the API response returns { pendingCount, closedCount }
      const { pendingCount, closedCount } = result.data;
  
      // Update the counts in the DOM
      document.getElementById('openContactCasesCount').textContent = pendingCount; // Update for pending requests
      document.getElementById('closedContactCasesCount').textContent = closedCount; // Update for closed requests
    } catch (error) {
      handleErrors(error, 'updateContactUsCounts');
    }
  }
  
  // Execute when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', updateContactUsCounts);