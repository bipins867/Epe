let referralId;
document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");

  if (token) {
    window.location.replace("/user/dashboard");
  }

  const urlParams = new URLSearchParams(window.location.search);
  referralId = urlParams.get("referralId");

  if (referralId) {
    document.getElementById("referralBlock").style.display = "block";

    try {
      const response = await postRequest(
        `user/piggyBox/referral/post/userReferralInfo`,
        { referralId }
      );
      if (response.data) {
        document.getElementById("referralCandidateId").value =
          response.data.candidateId || "Invalid Candidate Id";
        document.getElementById("referralCandidateName").value =
          response.data.name || "Invalid Candidate Name";
      } else {
        document.getElementById("referralCandidateId").value =
          "Invalid Candidate Id";
        document.getElementById("referralCandidateName").value =
          "Invalid Candidate Name";
      }
    } catch (err) {
      handleErrors(err);
    }
  }
});

document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const phone = document.getElementById("phone").value;
    const name = document.getElementById("name").value;
    const employeeId = document.getElementById("employeeId").value;
    const email = document.getElementById("email").value;

    if (password !== confirmPassword) {
      alert("Password Mismatch!");
      return;
    }

    const obj = {
      phone,
      password,
      name,
      employeeId,
      byReferallId: referralId,
      otpType: "signUp",
    };

    if (email) {
      obj.email = email; // Add email only if it is filled
    }

    try {
      document.getElementById("signup-button").disabled = true;
      const result = await postRequest("user/auth/post/signUp", obj);
      alert(result.data.message);

      localStorage.setItem(
        "otpAuthenticationToken",
        result.data.otpAuthenticationToken
      );
      localStorage.setItem("otpType", result.data.otpType);
      window.location.replace("/user/auth/otpVerify");
    } catch (err) {
      document.getElementById("signup-button").disabled = false;
      handleErrors(err);
    }
  });
