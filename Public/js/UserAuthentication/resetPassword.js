document.getElementById("resetPasswordForm").addEventListener("submit", async function (event) {
    event.preventDefault();
  
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
  
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    const token = new URLSearchParams(window.location.search).get("token"); // Assuming the reset token is passed in the URL
  
    const obj = { newPassword, token };
  
    try {
      document.getElementById('reset-btn').disabled = true;
      const result = await axios.post(baseUrl + "user/auth/post/reset-password", obj);
  
      // Handle successful password reset
      alert("Password has been reset successfully.");
      window.location.replace("/user/auth/login");
    } catch (err) {
      document.getElementById('reset-btn').disabled = false;
      handleErrors(err);
    }
  });
  