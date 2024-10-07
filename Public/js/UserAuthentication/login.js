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

  const obj = { phone, password };

  try {
    document.getElementById('login-btn').disabled = true;
    const result = await axios.post(baseUrl + "user/auth/post/login", obj);

    const data = result.data;
    localStorage.setItem("token", data.token);
    window.location.replace("/user/piggyBox");
  } catch (err) {
    document.getElementById('login-btn').disabled = false;
    handleErrors(err);
  }
});
