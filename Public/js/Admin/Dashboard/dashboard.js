document.addEventListener("DOMContentLoaded", async function () {
  try {
    const result = await getRequestWithToken("admin/dashboardInfo");
    
    
    const adminInfo=result.data.adminInfo;
   
    const userName =adminInfo.userName; 
    console.log(userName);
    // This would be dynamically set in a real application
    document.getElementById("userId").textContent = `UserName: ${userName}`;
  
    // Handle Logout Button
    document.getElementById("logoutBtn").addEventListener("click", function () {
      // Handle logout logic here, e.g., clear session and redirect to login page
      localStorage.removeItem('adminToken')
      window.location.href = "/admin/login"; // Redirect to login page
    });
  } catch (err) {
    
    const response = await err.response.data;

    if (response.message) {
      alert(response.message);
    } else {
      alert(response.error);
    }
  }

  // Display User ID
  

  // Handle List Item Clicks
  document
    .getElementById("adminOptions")
    .addEventListener("click", function (event) {
      if (event.target && event.target.nodeName === "LI") {
        const selectedOption = event.target.textContent;
        console.log(`${selectedOption} selected`);

        // Update content area based on the selected option
        const contentArea = document.getElementById("contentArea");
        contentArea.innerHTML = `<h3>${selectedOption}</h3><p>Manage the ${selectedOption} settings here.</p>`;
      }
    });
});
