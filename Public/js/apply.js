const applyFormButton = document.getElementById("open-apply-form-btn");
      const closeApplyFormButton = document.getElementById("close-apply-form-btn");
      const applyFormModal = document.getElementById("apply-form-modal");

      applyFormButton.addEventListener("click", () => {
        applyFormModal.style.display = "flex";
      });

      closeApplyFormButton.addEventListener("click", () => {
        applyFormModal.style.display = "none";
      });

      // Close the modal if clicking outside the form
      window.addEventListener("click", (event) => {
        if (event.target === applyFormModal) {
          applyFormModal.style.display = "none";
        }
      });