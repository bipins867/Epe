const baseUrl = "http://localhost:3000/";

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
      const result = await axios.post(
        baseUrl + "user/auth/post/verifyOtp",
        obj
      );
      alert(result.data.message);
      window.location.replace("/user/auth/otpVerify");
      localStorage.setItem("signUpToken", result.data.signUpToken);
    } catch (err) {
      const response = await err.response.data;

      if (response.errors) {
        let err = "";
        Object.keys(response.errors).forEach((er) => {
          err = err + response.errors[er] + "\n";
        });
        alert(err);
      } else {
        if (response.message) {
          alert(response.message);
        } else {
          alert(response.error);
        }
      }
    }
  });
