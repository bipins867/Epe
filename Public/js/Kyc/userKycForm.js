const name = document.getElementById("name");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const dob = document.getElementById("dob");
const address = document.getElementById("address");
const userImage = document.getElementById("userImage").files[0];
const aadharNumber = document.getElementById("aadharNumber");
const customerId = document.getElementById("customerId");
const aadharFront = document.getElementById("aadharFront").files[0];
const aadharBack = document.getElementById("aadharBack").files[0];
const panNumber = document.getElementById("panNumber");
const panFile = document.getElementById("panFile").files[0];

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const result = await getRequest("user/dashboard/post/info");

    const data = result.data;
    // Example user data
    const userKyc = data.userKyc;

    if (userKyc) {
      if (userKyc.status == "Completed" || userKyc.status == "Pending") {
        window.location.href = "/user/dashboard";
      }
    }

    name.value = data.name;
    email.value = data.email;
    phone.value = data.phone;

    if (userKyc) {
      dob.value = userKyc.dob;
      aadharNumber.value = userKyc.aadharNumber;
      panNumber.value = userKyc.panNumber;
      address.value = userKyc.address;
      customerId.value = userKyc.customerId;
    }
  } catch (err) {
    handleErrors(err);
  }
});

document
  .getElementById("kycForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("dob", document.getElementById("dob").value);
    formData.append("customerId", document.getElementById("customerId").value);
    formData.append("address", document.getElementById("address").value);
    formData.append("userImage", document.getElementById("userImage").files[0]);
    formData.append(
      "aadharNumber",
      document.getElementById("aadharNumber").value
    );
    formData.append(
      "aadharFront",
      document.getElementById("aadharFront").files[0]
    );
    formData.append(
      "aadharBack",
      document.getElementById("aadharBack").files[0]
    );
    formData.append("panNumber", document.getElementById("panNumber").value);
    formData.append("panFile", document.getElementById("panFile").files[0]);

    try {
      const token = localStorage.getItem("token");
      document.getElementById("kyc-submit").disabled = true;
      const response = await axios.post(
        baseUrl + "user/kyc/post/kycSubmit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: token,
          },
        }
      );
      alert(response.data.message);
      window.location.replace("/user/dashboard");
    } catch (err) {
      document.getElementById("kyc-submit").disabled = false;
      // Check if there's no response from the server (network error, etc.)
      handleErrors(err);
    }
  });
