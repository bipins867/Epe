

document.addEventListener("DOMContentLoaded", async function () {
  const token=localStorage.getItem('token')

  if(token){
    window.location.replace("/user/dashboard");
  }
});
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailOrPhone = document.getElementById("emailOrPhone").value;
    const password = document.getElementById("password").value;

    let obj;
    if (emailOrPhone.includes("@")) {
      const email = emailOrPhone;
      obj = { email, password };
    } else {
      const phone = emailOrPhone;
      obj = { phone, password };
    }

    try {
      document.getElementById('login-btn').disabled=true;
      const result = await axios.post(
        baseUrl + "user/auth/post/login",
        obj
      );
     

      
      // console.log(result.data);
      // alert('Login Successfull!')
      const data = result.data;
      //console.log(data.token)
      
      localStorage.setItem("token", data.token);
      window.location.replace("/user/dashboard");
      //console.log(data);
    } catch (err) {
      document.getElementById('login-btn').disabled=false;
      handleErrors(err);
    }
  });
