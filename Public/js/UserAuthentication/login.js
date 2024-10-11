document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem('token');

  if (token) {
    window.location.replace("/user/dashboard");
  }
});

document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  const obj = { phone, password,otpType:'login' };

  try {
    document.getElementById('login-btn').disabled = true;
    const result = await postRequest("user/auth/post/login", obj);

    // Handle OTP sent success
    alert(result.data.message);

    localStorage.setItem(
      "otpAuthenticationToken",
      result.data.otpAuthenticationToken
    );
    localStorage.setItem("otpType", result.data.otpType);
    window.location.replace("/user/auth/otpVerify");
  } catch (err) {
    document.getElementById('login-btn').disabled = false;
    handleErrors(err);
  }
});
