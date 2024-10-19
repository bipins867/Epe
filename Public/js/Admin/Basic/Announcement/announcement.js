document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadAnnouncements();
  } catch (error) {
    handleErrors(error);
  }
});

async function loadAnnouncements() {
  await loadListAnnouncements();
  await loadSliderAnnouncements();
}

const loadListAnnouncements = async () => {
  try {
    const result1 = await postRequestWithToken(
      "admin/basic/announcement/post/getAll",
      {}
    );

    const announcement1 = result1.data.data; // Assuming the API returns an array of announcement1

    populateAnnouncementList(announcement1);
  } catch (error) {
    handleErrors(error);
  }
};
const loadSliderAnnouncements = async () => {
  try {
    const result2 = await postRequestWithToken(
      "basic/post/getAllActiveAnnouncments",
      {}
    );

    const announcement2 = result2.data.data;
    updateSlider(announcement2);
  } catch (error) {
    handleErrors(error);
  }
};

const updateSlider = (announcements) => {
  const wrapper = document.getElementById("announcement-wrapper");
  wrapper.innerHTML = ""; // Clear previous announcements

  // Create a string to hold all announcement messages with separation
  const announcementMessages = announcements
    .map((announcement) => announcement.message)
    .join(" | ");

  // Create a new element to hold the messages
  const messageDiv = document.createElement("b");
  messageDiv.className = "announcement-message";
  messageDiv.innerText = announcementMessages; // Set the concatenated message

  // Append the messageDiv to the wrapper
  wrapper.appendChild(messageDiv);
};

const populateAnnouncementList = (announcements) => {
  const tbody = document.getElementById("members-table-body");
  tbody.innerHTML = ""; // Clear previous rows

  announcements.forEach((announcement, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <th scope="row">${index + 1}</th>
        <td>${announcement.message}</td>
        <td>${announcement.type}</td>
        <td>${new Date(announcement.createdAt).toLocaleDateString()}</td>
        <td>${new Date(announcement.createdAt).toLocaleTimeString()}</td>
        <td>${announcement.isActive ? "Activated" : "Deactivated"}</td>
        <td>
          <button class="btn btn-warning" onclick="updateAnnouncementStatus('${
            announcement.id
          }', ${announcement.isActive})">
            ${announcement.isActive ? "Deactivate" : "Activate"}
          </button>
          <button class="btn btn-danger" onclick="deleteAnnouncement('${
            announcement.id
          }')">Delete</button>
        </td>
      `;
    tbody.appendChild(tr);
  });
};

const createAnnouncement = async () => {
  const description = document.getElementById("description").value;

  if (!description) {
    alert("Please enter an announcement message.");
    return;
  }

  try {
    await postRequestWithToken("admin/basic/announcement/post/create", {
      message: description,
      type: "General",
      isActive: true,
    });
    await loadAnnouncements(); // Reload announcements after creation
    document.getElementById("description").value = ""; // Clear input
  } catch (error) {
    handleErrors(error);
  }
};

const updateAnnouncementStatus = async (id, isActive) => {
  const newStatus = !isActive;

  try {
    await postRequestWithToken("admin/basic/announcement/post/update", {
      id,
      isActive: newStatus,
    });
    await loadAnnouncements(); // Reload announcements after status update
  } catch (error) {
    handleErrors(error);
  }
};

const deleteAnnouncement = async (id) => {
  if (!confirm("Are you sure you want to delete this announcement?")) {
    return;
  }

  try {
    await postRequestWithToken("admin/basic/announcement/post/delete", { id });
    await loadAnnouncements(); // Reload announcements after deletion
  } catch (error) {
    handleErrors(error);
  }
};

document
  .getElementById("create-announcement")
  .addEventListener("click", createAnnouncement);
