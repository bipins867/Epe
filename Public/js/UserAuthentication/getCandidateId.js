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

    const obj = { phone };

    try {
      document.getElementById("send-otp-btn-id").disabled = true;
      const result = await axios.post(
        baseUrl + "user/auth/post/verifyUserForgetCandidateIdOtp",
        obj
      );

      // Handle OTP sent success
      alert(result.data.message);

      localStorage.setItem("signUpToken", result.data.signUpToken);
      localStorage.setItem("otpType", result.data.type);
      window.location.replace("/user/auth/otpVerify");
    } catch (err) {
      document.getElementById("send-otp-btn-id").disabled = false;
      handleErrors(err);
    }
  });
