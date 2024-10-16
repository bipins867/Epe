document.addEventListener("DOMContentLoaded", function () {
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
    const otpAuthenticationToken = localStorage.getItem(
      "otpAuthenticationToken"
    );
    const otpType = localStorage.getItem("otpType");

    try {
      const obj = { userPhoneOtp, otpAuthenticationToken, otpType };
      otpSubmitButton.disabled = true;
      let response;
      if (otpType === "signUp") {
        response = await postRequest("user/auth/post/signUp", obj);
        if (response.status === 201) {
          alert(response.data.message);
          window.location.replace("/user/auth/login");
        }
      } else if (otpType === "login") {
        const result = await postRequest("user/auth/post/login", obj);
        //console.log(result.data);
        const data = result.data;
        localStorage.setItem("token", data.token);
        window.location.replace("/user/piggyBox");
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
        //console.log("What happend just now!");
        if (response.status === 200) {
          const message = `Customer Id:-${data.candidateId}\nName :- ${data.name}`;
          alert(message);
          window.location.replace("/user/auth/login");
        }
      } else if (otpType === "activateAccount") {
        response = await postRequest("user/auth/post/activateAccount", obj);
        const data = response.data;
        //console.log("What happend just now!");
        if (response.status === 200) {
          const message = `Account activated successfully! Customer Id:-${data.user.candidateId}`;
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
      const otpAuthenticationToken = localStorage.getItem(
        "otpAuthenticationToken"
      );
      const obj = {
        otpAuthenticationToken,
        otpType: localStorage.getItem("otpType"),
      };
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
    document.getElementById("password-section-1").style.display = "flex";
    document.getElementById("password-section-2").style.display = "flex";
  } else {
    document.getElementById("password-section-1").style.display = "none";
    document.getElementById("password-section-2").style.display = "none";
  }
}
