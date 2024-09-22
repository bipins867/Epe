// Function to fetch and display closed Contact Us details
async function fetchClosedContactUsDetails() {
    try {
      // Get the ID from the URL
      const urlParts = window.location.pathname.split('/');
      const id = urlParts[urlParts.length - 1];
  
      // Make the API call to fetch closed Contact Us details
      const result = await postRequestWithToken(`admin/basic/contactUs/post/contactUsInfo/${id}`);
  
      // Assuming the API response returns an object with contact details
      const contact = result.data;
  
      // Update the DOM with contact details
      document.getElementById('name').textContent = contact.name;
      document.getElementById('email').textContent = contact.email;
      document.getElementById('phoneNumber').textContent = contact.phoneNumber;
      document.getElementById('reasonForContact').textContent = contact.reasonForContact;
      document.getElementById('statusChecked').textContent = contact.statusChecked ? 'Yes' : 'No';
      document.getElementById('adminId').textContent = contact.adminId;
      document.getElementById('adminRemark').textContent = contact.adminRemark || 'N/A';
    } catch (error) {
      handleErrors(error, 'fetchClosedContactUsDetails');
    }
  }
  
  // Fetch the closed Contact Us details when the DOM content is fully loaded
  document.addEventListener('DOMContentLoaded', fetchClosedContactUsDetails);
  