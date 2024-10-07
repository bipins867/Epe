document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  if (token) {
    localStorage.removeItem("token");
    this.location.reload();
    //window.location.replace("/user/dashboard");
  }
});

document
  .getElementById("forgetPasswordForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const candidateId = document.getElementById("candidateId").value;
    const phone = document.getElementById("phone").value;

    const obj = { candidateId, phone };

    try {
      document.getElementById("send-otp-btn").disabled = true;
      const result = await axios.post(
        baseUrl + "user/auth/post/verifyUserResetOrForgetPasswordOtp",
        obj
      );

      // Handle OTP sent success
      alert(result.data.message);
      localStorage.setItem("signUpToken", result.data.signUpToken);
      localStorage.setItem("otpType", result.data.type);
      window.location.replace("/user/auth/otpVerify");
    } catch (err) {
      document.getElementById("send-otp-btn").disabled = false;
      handleErrors(err);
    }
  });
