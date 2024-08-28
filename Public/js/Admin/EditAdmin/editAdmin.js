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
                        <td>${admin.adminType}</td>
                        <td>${admin.freezeStatus ? "Frozen" : "Active"}</td>
                        <td>
                            <button class="btn btn-sm btn-primary edit-btn" data-id="${
                              admin.userName
                            }">Edit</button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${
                              admin.userName
                            }">Delete</button>
                        </td>
                    `;

          adminsTableBody.appendChild(row);
        });

        // Attach event listeners for Edit and Delete buttons
        attachEventListeners();
      })
      .catch(function (error) {
        console.error("Error fetching admins:", error);
      });
  }

  // Function to attach event listeners to Edit and Delete buttons
  function attachEventListeners() {
    document.querySelectorAll(".edit-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        const adminId = this.getAttribute("data-id");
       
        localStorage.setItem('tempAdminId',adminId)
        window.location.replace("/admin/editUserAdmin");
        // Add your edit logic here
      });
    });

    document.querySelectorAll(".delete-btn").forEach(function (button) {
      button.addEventListener("click",async function () {
        const adminId = this.getAttribute("data-id");

        await postRequestWithToken(`admin/userAndRole/post/deleteAdmin/${adminId}`);
        // Add your delete logic here
        location.reload();
      });
    });
  }

  // Handle Add New SAdmin Form Submission

  document
    .getElementById("addSAdminForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const password = document.getElementById("sAdminPassword").value;
      const role = document.getElementById("sAdminRole").value;

      const obj = { password: password };
      try {
        let result;
        if (role == "A") {
          result = await postRequestWithToken(
            "admin/userAndRole/post/createAdmin",
            obj
          );
        } else {
          result = await postRequestWithToken(
            "admin/userAndRole/post/createSAdmin",
            obj
          );
        }
        const admin = result.data.admin;

        alert(`${admin.userName} is created successfullly!`);
        location.reload();
      } catch (err) {
        const response = await err.response.data;

        if (response.message) {
          alert(response.message);
        } else {
          alert(response.error);
        }
      }
    });

  // Initial fetch of admins when the page loads
  fetchAdmins();
});
