const contactUsFormButton = document.getElementById("open-contactUs-form-btn");
const closeContactUsFormButton = document.getElementById("close-contactUs-form-btn");
const contactUsFormModal = document.getElementById("contactUs-form-modal");

contactUsFormButton.addEventListener("click", () => {
  contactUsFormModal.style.display = "flex";
});

closeContactUsFormButton.addEventListener("click", () => {
  contactUsFormModal.style.display = "none";
});

// Close the modal if clicking outside the form
window.addEventListener("click", (event) => {
  if (event.target === contactUsFormModal) {
    contactUsFormModal.style.display = "none";
  }
});
