document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
  
    if (token) {
      window.location.replace("/user/dashboard");
    }
  });
  
  document
    .getElementById("getCandidateIdForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
  
      const phone = document.getElementById("phone").value;
      
      const apiUrl="user/auth/post/activateAccount";
      const obj = { phone, otpType: "activateAccount" ,apiUrl};
  
      try {
        document.getElementById("send-otp-btn-id").disabled = true;
        
        const result = await postRequest(apiUrl, obj);
  
        // Handle OTP sent success
        alert(result.data.message);
  
        localStorage.setItem(
          "otpAuthenticationToken",
          result.data.otpAuthenticationToken
        );
        localStorage.setItem("otpType", result.data.otpType);
        window.location.replace("/user/auth/otpVerify");
      } catch (err) {
        document.getElementById("send-otp-btn-id").disabled = false;
        handleErrors(err);
      }
    });
  