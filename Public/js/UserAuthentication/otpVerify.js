document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.replace("/user/dashboard");
  }

  let resendTimer = 10;
  const resendOtpButton = document.getElementById("resendOtp");
  const otpSubmitButton = document.getElementById("otp-submit");
  const timerSpan = document.getElementById("timer");

  // Start a 10-second timer for the resend button to be enabled
  const interval = setInterval(() => {
    resendTimer--;
    timerSpan.textContent = resendTimer;
    if (resendTimer === 0) {
      resendOtpButton.disabled = false;
      clearInterval(interval);
    }
  }, 1000);

  // Handle OTP submission
  otpSubmitButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const userPhoneOtp = document.getElementById("phoneOtp").value;
    const signUpToken = localStorage.getItem("signUpToken");

    try {
      const obj = { userPhoneOtp, signUpToken };
      otpSubmitButton.disabled = true;
      const response = await postRequest("user/auth/post/signUp", obj);
      if (response.status === 201) {
        alert(response.data.message);
        window.location.replace("/user/auth/login");
      }
    } catch (err) {
      otpSubmitButton.disabled = false;
      handleErrors(err);
    }
  });

  // Resend OTP button functionality
  resendOtpButton.addEventListener("click", async () => {
    resendOtpButton.disabled = true;
    resendTimer = 30; // 30-second cooldown timer after resending OTP
    timerSpan.textContent = resendTimer;

    try {
      const signUpToken = localStorage.getItem("signUpToken");
      const obj = { signUpToken, otpType: "phone" };
      const response = await postRequest("user/auth/post/resendOtp", obj);
      alert(response.data.message);
    } catch (err) {
      handleErrors(err);
    }

    // Start the 30-second cooldown for resend OTP
    const resendInterval = setInterval(() => {
      resendTimer--;
      timerSpan.textContent = resendTimer;
      if (resendTimer === 0) {
        resendOtpButton.disabled = false;
        clearInterval(resendInterval);
        timerSpan.textContent = "";
      }
    }, 1000);
  });
});
