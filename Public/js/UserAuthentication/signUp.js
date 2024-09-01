document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var name = document.getElementById("name").value;

    if (password !== confirmPassword) {
      event.preventDefault(); // Prevent form submission

      alert("Password Mismatch!");
      return;
    }

    const obj = { email, phone, password, name };

    try {
      document.getElementById('signup-button').disabled=true;
      const result = await axios.post(
        baseUrl + "user/auth/post/verifyOtp",
        obj
      );
      alert(result.data.message);
      window.location.replace("/user/auth/otpVerify");
      localStorage.setItem("signUpToken", result.data.signUpToken);
    } catch (err) {
      document.getElementById('signup-button').disabled=false;
      handleErrors(err);
    }
  });
