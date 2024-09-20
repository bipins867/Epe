document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");

  if (token) {
    window.location.replace("/user/dashboard");
  }
});

document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var phone = document.getElementById("phone").value;
    var name = document.getElementById("name").value;

    var email = document.getElementById("email").value;

    if (password !== confirmPassword) {
      alert("Password Mismatch!");
      return;
    }

    const obj = { phone, password, name };

    if (email) {
      obj.email = email; // Add email only if it is filled
    }

    try {
      document.getElementById("signup-button").disabled = true;
      const result = await axios.post(baseUrl + "user/auth/post/verifyOtp", obj);
      alert(result.data.message);
      window.location.replace("/user/auth/otpVerify");
      localStorage.setItem("signUpToken", result.data.signUpToken);
    } catch (err) {
      document.getElementById("signup-button").disabled = false;
      handleErrors(err);
    }
  });
