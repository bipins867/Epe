document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await getRequest("getServerInfo");

    const socketPort = response.data.socketPort;
    localStorage.setItem("socketPort", socketPort);
  } catch (err) {
    handleErrors(err);
  }
  const token = localStorage.getItem("adminToken");

  if (token) {
    window.location.replace("/user/dashboard");
  }
});
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Data to be sent in the POST request
    const loginData = {
      userName: username,
      password: password,
    };

    try {
      document.getElementById("login-btn").disabled = true;
      const result = await postRequest("admin/post/login", loginData);
      console.log(result);
      if (result.status == 201) {
        window.location.replace("/admin/dashboard");
      }
      //

      // alert('Login Successfull!')
      const data = result.data;
      localStorage.setItem("adminToken", data.token);
    } catch (err) {
      document.getElementById("login-btn").disabled = false;
      handleErrors(err);
    }
  });
