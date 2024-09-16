document.addEventListener("DOMContentLoaded", function () {
  // Fetch Admins List from Server
  function fetchAdmins() {
      getRequestWithToken("admin/adminList")
          .then(function (response) {
              const admins = response.data.admins;
              const adminType = response.data.adminType;

              if (adminType == "SA") {
                  const sAdminRole = document.getElementById("sAdminRole");
                  sAdminRole.disabled = true;
              }

              const adminsTableBody = document.querySelector("#adminsTable tbody");
              adminsTableBody.innerHTML = ""; // Clear existing rows

              admins.forEach(function (admin) {
                  const row = document.createElement("tr");

                  row.innerHTML = `
                      <td>${admin.id}</td>
                      <td>${admin.userName}</td>
                      <td>${admin.name}</td>
                      <td>${admin.email}</td>
                      <td>${admin.adminType}</td>
                      <td>
                          <label class="switch">
                              <input type="checkbox" class="freeze-toggle" data-id="${admin.id}" ${admin.freezeStatus ? 'checked' : ''}>
                              <span class="slider round"></span>
                          </label>
                      </td>
                      <td>
                          <button class="btn btn-sm btn-primary edit-btn" data-id="${admin.userName}">Edit</button>
                          <button class="btn btn-sm btn-danger delete-btn" data-id="${admin.userName}">Delete</button>
                      </td>
                  `;

                  adminsTableBody.appendChild(row);
              });

              // Attach event listeners for Edit, Delete buttons, and Freeze toggle
              attachEventListeners();
          })
          .catch(function (error) {
              handleErrors(error,mapFunction);
          });
  }

  // Function to attach event listeners to Edit, Delete buttons, and Freeze toggle
  function attachEventListeners() {
      document.querySelectorAll(".edit-btn").forEach(function (button) {
          button.addEventListener("click", function () {
              const adminId = this.getAttribute("data-id");
              localStorage.setItem("tempAdminId", adminId);
              window.location.replace("/admin/editUserAdmin");
          });
      });

      document.querySelectorAll(".delete-btn").forEach(function (button) {
          button.addEventListener("click", async function () {
              const adminId = this.getAttribute("data-id");
              if (confirm("Are you sure you want to delete this admin?")) {
                  try {
                      await postRequestWithToken(`admin/userAndRole/post/deleteAdmin/${adminId}`);
                      location.reload();
                  } catch (err) {
                      handleErrors(err,mapFunction);
                  }
              }
          });
      });

      document.querySelectorAll(".freeze-toggle").forEach(function (toggle) {
          toggle.addEventListener("change", async function () {
              const adminId = this.getAttribute("data-id");
              const freezeStatus = this.checked;

              try {
                  await postRequestWithToken('admin/userAndRole/post/updateAdminStatus', { adminId: adminId, freezeStatus: freezeStatus });
                  alert(`Admin ${adminId} freeze status updated to ${freezeStatus ? 'Frozen' : 'Active'}.`);
              } catch (err) {
                  handleErrors(err,mapFunction);
              }
          });
      });
  }

  // Handle Add New SAdmin Form Submission
  document.getElementById("addSAdminForm").addEventListener("submit", async function (event) {
      event.preventDefault();

      const name = document.getElementById("sAdminName").value;
      const email = document.getElementById("sAdminEmail").value;
      const password = document.getElementById("sAdminPassword").value;
      const role = document.getElementById("sAdminRole").value;

      const obj = { name: name, email: email, password: password };
      try {
          document.getElementById('create-admin-btn').disabled = true;
          let result;
          if (role == "A") {
              result = await postRequestWithToken("admin/userAndRole/post/createAdmin", obj);
          } else {
              result = await postRequestWithToken("admin/userAndRole/post/createSAdmin", obj);
          }
          const admin = result.data.admin;

          alert(`${admin.userName} is created successfully!`);
          location.reload();
      } catch (err) {
          document.getElementById('create-admin-btn').disabled = false;
          handleErrors(err,mapFunction);
      }
  });

  // Initial fetch of admins when the page loads
  fetchAdmins();
});
