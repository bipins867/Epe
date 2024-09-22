

// Function to fetch contact details based on ID from the URL
async function fetchContactDetails(id) {
  try {
    // Make the API call to fetch contact details
    const result = await postRequestWithToken(`admin/basic/contactUs/post/contactUsInfo/${id}`);

    // Assuming the API response is an object with contact details
    const contact = result.data;

    // Update the DOM with contact details
    document.getElementById('name').textContent = contact.name;
    document.getElementById('email').textContent = contact.email;
    document.getElementById('phoneNumber').textContent = contact.phoneNumber;
    document.getElementById('reasonForContact').textContent = contact.reasonForContact;
    document.getElementById('statusChecked').textContent = contact.statusChecked ? 'Yes' : 'No';
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}

// Function to submit the admin remark
async function submitRemark(id) {
  const adminRemark = document.getElementById('adminRemark').value;

  try {
    // Make the API call to submit the remark
    await postRequestWithToken(`admin/basic/contactUs/post/addAdminRemark/${id}`, { adminRemark });
    alert('Remark submitted successfully!');
    window.location.replace("/admin/basic/openContactUsList");
  } catch (error) {
    handleErrors(error, mapFunction);
  }
}

// Fetch the contact details when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Extract the ID from the URL path
  const pathSegments = window.location.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1]; // Get the last segment

  if (id) {
    fetchContactDetails(id);

    // Add event listener for the submit remark button
    document.getElementById('submitRemarkBtn').addEventListener('click', () => {
      submitRemark(id);
    });
  } else {
    console.error('ID not found in URL');
  }
});
