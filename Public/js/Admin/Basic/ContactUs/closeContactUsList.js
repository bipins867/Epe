// Function to fetch and display closed ContactUs requests
async function fetchClosedContactUs() {
    try {
      // Make the API call to fetch closed contact requests
      const result = await postRequestWithToken('admin/basic/contactUs/post/getClosedList');
  
      // Assuming the API response is an array of contact requests
      const contacts = result.data;
  
      // Get the tbody element where contact data will be inserted
      const contactUsListBody = document.getElementById('contactUsListBody');
      
      // Clear existing rows
      contactUsListBody.innerHTML = '';
  
      // Iterate over the contacts and create rows dynamically
      contacts.forEach((contact) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${contact.id}</td>
          <td>${contact.name}</td>
          <td>${contact.email}</td>
          <td>${contact.statusChecked ? 'Yes' : 'No'}</td>
          <td>
            <a class="btn btn-primary btn-sm" href="closeContactUs/${contact.id}">View</a>
          </td>
        `;
        
        // Append the new row to the table body
        contactUsListBody.appendChild(row);
      });
    } catch (error) {
      handleErrors(error, 'fetchClosedContactUs');
    }
  }
  
  // Fetch the contact requests when the DOM content is fully loaded
  document.addEventListener('DOMContentLoaded', fetchClosedContactUs);
  