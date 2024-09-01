// Additional functionality like validating OTP or handling submit can be added here
document
  .getElementById("otp-submit")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const userEmailOtp = document.querySelector(
      "input[placeholder='Enter Email OTP']"
    ).value;
    const userPhoneOtp = document.querySelector(
      "input[placeholder='Enter Phone OTP']"
    ).value;

    const signUpToken = localStorage.getItem("signUpToken");

    try {
      const obj = { userEmailOtp, userPhoneOtp, signUpToken };
      document.getElementById('otp-submit').disabled=true;
      const response = await postRequest("user/auth/post/signUp", obj);

      if (response.status == 201) {
        alert(response.data.message);
        window.location.replace("/user/auth/login");
      }
    } catch (err) {
      document.getElementById('otp-submit').disabled=false;
      handleErrors(err);
    }
  });
