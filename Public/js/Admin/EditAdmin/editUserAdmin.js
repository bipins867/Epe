document.addEventListener("DOMContentLoaded", function () {
  const adminId = localStorage.getItem("tempAdminId"); // This would be dynamically set based on the admin being edited
  const assignedRoles = [];
  if (!adminId) {
    window.location.replace("/admin/editAdmin");
  }
  document.getElementById("userName").value = adminId;
  // Fetch Admin Data from Server
  function fetchAdminData(adminId) {
    postRequestWithToken("admin/userAndRole/post/getRolesList", {
      userName: adminId,
    }) // Replace with your actual API endpoint
      .then(function (response) {
        // Populate roles with checkboxes

        populateRoles(response.data.roles, response.data.activeRoles);
      })
      .catch(function (error) {
        handleErrors(error,mapFunction);
      });
  }

  // Populate roles with checkboxes

  // Handle Password Reset Form Submission
  document
    .getElementById("resetPasswordForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (newPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        document.getElementById('btn-reset').disabled=true;
        const result = await postRequestWithToken(
          "admin/userAndRole/post/changePassword",
          {
            password: newPassword,
            userName: adminId,
          }
        );
        alert(result.data.message);
        location.reload();
      } catch (err) {
        document.getElementById('btn-reset').disabled=false;
        handleErrors(err,mapFunction);
      }
    });

  // Handle Update Roles Button Click
  // Function to populate roles with checkboxes
  function populateRoles(roles, activeRoles) {
    const rolesList = document.getElementById("rolesList");
    rolesList.innerHTML = ""; // Clear existing roles

    // Create a Set of active role IDs for quick lookup
    const activeRoleIds = new Set(activeRoles.map((role) => role.id));

    roles.forEach(function (role) {
      const isChecked = activeRoleIds.has(role.id); // Check if the role is in activeRoles
      const roleItem = document.createElement("div");
      roleItem.classList.add("form-check");

      roleItem.innerHTML = `
        <input class="form-check-input role-checkbox" type="checkbox" id="role-${
          role.id
        }" data-role-name="${role.roleName}" ${isChecked ? "checked" : ""}>
        <label class="form-check-label" for="role-${role.id}">
          ${role.roleName}
        </label>
      `;

      rolesList.appendChild(roleItem);
    });
  }

  // Function to handle the submission of updated roles
  document.getElementById("updateRolesBtn").onclick = async function () {
    const selectedRoles = [];
    document.querySelectorAll(".role-checkbox").forEach(function (checkbox) {
      if (checkbox.checked) {
        selectedRoles.push(checkbox.getAttribute("data-role-name"));
      }
    });

    const payload = {
      userName: adminId, // Assuming email is stored in username field
      roles: selectedRoles,
    };

    try {
      document.getElementById("updateRolesBtn").disabled=true;
      const result = await postRequestWithToken(
        "admin/userAndRole/post/updateAdminRoles",
        payload
      );
      document.getElementById("updateRolesBtn").disabled=false;
      alert(result.data.message);
    } catch (err) {
      document.getElementById("updateRolesBtn").disabled=false;
      handleErrors(err,mapFunction);
    }
  };

  // Fetch initial admin data and roles when the page loads
  fetchAdminData(adminId);
});
