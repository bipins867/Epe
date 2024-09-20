document.addEventListener("DOMContentLoaded", async function () {

    

  onLoadAnimation("hero-content", "slide-in-left");
  onLoadAnimation("hero-image", "slide-in-right");
  

  onLoadAnimation("feature-header", "slide-in-down");
  onLoadAnimation("feature-cards", "slide-in-up");

  onLoadAnimation("about-slide-container-left", "slide-in-right");
  onLoadAnimation("about-slide-container-right", "slide-in-left");
  onLoadAnimation("about-main-header", "slide-in-up");

  onLoadAnimation("services-item", "fade-in");

  onLoadAnimation("about-area", "slide-in-left");

  onLoadAnimation("footer-area", "slide-in-up");

  onLoadAnimation("project-title", "slide-in-left");
  onLoadAnimation("project-button-group", "slide-in-right");
  onLoadAnimation("project-image-item", "zoom-in");



  setupFunction();
});



document.getElementById('header-contact-btn').addEventListener('click',()=>{

  document.getElementById('open-contactUs-form-btn').click();
})
document.getElementById('quick-contact-btn').addEventListener('click',()=>{

  document.getElementById('open-contactUs-form-btn').click();
})



async function postRequest(url, obj) {
  const result = await axios.post(baseUrl + url, obj);
  return result;
}

function setupFunction() {
  // Base URL for the API
  
  

  // Apply form submit event listener
  const applyForm = document.getElementById("apply-form");
  applyForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const loanType = document.getElementById("loan-type").value;
    const reason = document.getElementById("reason").value;

    // Prepare data object
    const loanData = {
      name,
      email,
      phoneNumber: phone,
      loanType,
      reasonForLoan: reason
    };

    try {
      const response = await postRequest('basic/post/applyLoan', loanData);
      alert(response.data.message); // Show success message
    } catch (error) {
      
      handleError(error)
    }

    // Clear the form inputs
    applyForm.reset();
  });

  // Contact Us form submit event listener
  const contactForm = document.getElementById("contact-form");
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const name = document.querySelector("#contact-form #name").value;
    const email = document.querySelector("#contact-form #email").value;
    const phone = document.querySelector("#contact-form #phone").value;
    const reason = document.querySelector("#contact-form #reason").value;

    // Prepare data object
    const contactData = {
      name,
      email,
      phoneNumber: phone,
      reasonForContact: reason
    };

    try {
      const response = await postRequest('basic/post/contactUs', contactData);
      alert(response.data.message); // Show success message
    } catch (error) {
      handleError(error)

    }

    // Clear the form inputs
    contactForm.reset();
  });
}
