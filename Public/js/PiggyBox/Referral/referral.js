document.addEventListener("DOMContentLoaded", function () {
  const referralLinkInput = document.getElementById("referralLink");
  const copyButton = document.querySelector(".btn-copy");
  const facebookButton = document.querySelector(".facebook");
  const twitterButton = document.querySelector(".twitter");
  const pinterestButton = document.querySelector(".pinterest");
  const emailButton = document.querySelector(".email");
  const whatsappButton = document.querySelector(".whatsapp");
  const linkButton = document.querySelector(".link");
  const referralHistoryTableBody = document.querySelector(
    "#referHistory tbody"
  );

  // Copy referral link to clipboard
  copyButton.addEventListener("click", function () {
    referralLinkInput.select();
    document.execCommand("copy");
    alert("Referral link copied to clipboard!");
  });

  // Open platform-specific sharing
  facebookButton.addEventListener("click", function () {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${referralLinkInput.value}`,
      "_blank"
    );
  });

  twitterButton.addEventListener("click", function () {
    window.open(
      `https://twitter.com/intent/tweet?url=${referralLinkInput.value}`,
      "_blank"
    );
  });

  pinterestButton.addEventListener("click", function () {
    window.open(
      `https://pinterest.com/pin/create/button/?url=${referralLinkInput.value}`,
      "_blank"
    );
  });

  emailButton.addEventListener("click", function () {
    window.location.href = `mailto:?subject=Join Me&body=Here is my referral link: ${referralLinkInput.value}`;
  });

  whatsappButton.addEventListener("click", function () {
    window.open(
      `https://api.whatsapp.com/send?text=Here is my referral link: ${referralLinkInput.value}`,
      "_blank"
    );
  });

  linkButton.addEventListener("click", function () {
    navigator.clipboard.writeText(referralLinkInput.value);
    alert("Referral link copied to clipboard!");
  });

  // Fetch referral history
  function getReferralInfo() {
    postRequestWithToken("user/piggyBox/referral/post/referralInfo")
      .then((response) => {
        const referallUrl = response.data.referralUrl;
        document.getElementById("referralLink").value = referallUrl;
        document.getElementById('totalNoOfReferrals').innerText=response.data.numberOfReferrals
        document.getElementById('totalNoOfPendingReferrals').innerText=response.data.pendingReferrals
        
        populateReferralHistory(response.data.referredUsers);
      })
      .catch((error) => {
        handleErrors(error,mapFunction);
      });
  }

  // Populate referral history table
  function populateReferralHistory(referredUsers) {
    referralHistoryTableBody.innerHTML = ""; // Clear previous rows

    if (referredUsers.length === 0) {
      referralHistoryTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No data available in table</td></tr>`;
      return;
    }

    referredUsers.forEach((user, index) => {
      const dateOfJoining = user.dateOfJoining
        ? new Date(user.dateOfJoining).toLocaleDateString()
        : "N/A";
      const dateOfCompletion = user.dateOfCompletion
        ? new Date(user.dateOfCompletion).toLocaleDateString()
        : "N/A";
      const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${dateOfJoining}</td>
            <td>${user.candidateId}</td>
            <td>${user.name}</td>
            <td>${dateOfCompletion}</td>
            <td>${user.status}</td>
          </tr>
        `;
      referralHistoryTableBody.innerHTML += row;
    });
  }

  // Fetch referral info on page load
  getReferralInfo();
});
