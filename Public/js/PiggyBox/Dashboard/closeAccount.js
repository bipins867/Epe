document.addEventListener("DOMContentLoaded", function () {
  const acceptTermsCheckbox = document.getElementById("acceptTerms");
  const initiateCloseAccountButton = document.getElementById(
    "initiateCloseAccount"
  );

  acceptTermsCheckbox.addEventListener("change", () => {
    initiateCloseAccountButton.disabled = !acceptTermsCheckbox.checked;
  });

  initiateCloseAccountButton.addEventListener("click", async () => {
    try{
      const response = await postRequestWithToken(
        "user/piggyBox/post/userAccountClouserRequest"
      );
      // Handle the response as needed, e.g., show a message to the user
      alert(response.data.message);
      window.location.replace('/user/piggyBox')
    }
    catch(err){
      handleErrors(err,mapFunction);
    }
  });
});
