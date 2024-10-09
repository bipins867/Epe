document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.replace("/user/dashboard");
  }
  if (localStorage.getItem("otpType") === "resetPassword") {
    togglePasswordSectionView(true);
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
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const signUpToken = localStorage.getItem("signUpToken");
    const otpType = localStorage.getItem("otpType");

    try {
      const obj = { userPhoneOtp, signUpToken };
      otpSubmitButton.disabled = true;
      let response;
      if (otpType === "signUp") {
        response = await postRequest("user/auth/post/signUp", obj);
        if (response.status === 201) {
          alert(response.data.message);
          window.location.replace("/user/auth/login");
        }
      } else if (otpType === "resetPassword") {
        if (password !== confirmPassword) {
          return alert("Password Mismatch!");
        }

        response = await postRequest("user/auth/post/changeUserPassword", {
          ...obj,
          password: password,
        });
        if (response.status === 200) {
          alert(response.data.message);
          window.location.replace("/user/auth/login");
        }
      } else if (otpType === "forgetCandidateId") {
        response = await postRequest("user/auth/post/getUserInfo", obj);
        const data = response.data;
        console.log("What happend just now!");
        if (response.status === 200) {
          const message = `Customer Id:-${data.candidateId}\nName :- ${data.name}`;
          alert(message);
          window.location.replace("/user/auth/login");
        }
      } else {
        alert("Something went Wrong!");
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
      const obj = { signUpToken, otpType: localStorage.getItem("otpType") };
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

function togglePasswordSectionView(cond) {
  if (cond) {
    document.getElementById("password-section").style.display = "flex";
  } else {
    document.getElementById("password-section").style.display = "none";
  }
}
