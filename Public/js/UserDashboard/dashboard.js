document.addEventListener("DOMContentLoaded", async function () {
    // Fetch the user data from the server
    const result = await getRequest('user/dashboard/post/info');
    const data = result.data;
  
    // Extract user details from the response
    const user = {
      name: data.name,
      kycStatus: data.kycStatus,
      userKyc: data.userKyc // KYC details object
    };
  
    // Display user's name
    const userNameElement = document.getElementById("userName");
    userNameElement.textContent = `Welcome, ${user.name}!`;
  
    // Handle KYC status display logic
    handleKYCStatus(user);

    document.getElementById('completeKycButton').onclick = function() {
      const kycStatus=user.kycStatus;
      if (kycStatus=='Completed' && user.userKyc.userAggreementAccepted){
        window.location.href='/user/dashboard';
      }
      else if(kycStatus=='Not Submitted' || kycStatus=='Rejected' )
      { window.location.href = "/user/kyc/userForm";

      }
      else if(kycStatus=='Completed' && !user.userKyc.userAggreementAccepted){
        window.location.href = "/user/kyc/userKycAgreement";
      }
      
      if(kycStatus=='Pending'){
        alert("Wait for Admin to Verify!");
      }
       
    };
    
  });
  
  // Function to handle KYC status and display
  function handleKYCStatus(user) {
    const { kycStatus, userKyc } = user;
  
    // KYC status elements
    const incompleteKyc = document.getElementById('incompleteKyc');
    const completeKyc = document.getElementById('completeKyc');
    const pendingKyc = document.getElementById('pendingKyc');
    const rejectedKyc = document.getElementById('rejectedKyc');
    const completeKycButton = document.getElementById('completeKycButton');
  
    // Reset visibility of all status cards and button
    incompleteKyc.style.display = 'none';
    completeKyc.style.display = 'none';
    pendingKyc.style.display = 'none';
    rejectedKyc.style.display = 'none';
    completeKycButton.style.display = 'none'; // Default to hidden
  
    // Determine the KYC status and display the appropriate section
    if (kycStatus === 'Not Submitted' || userKyc === null) {
      // User has not submitted KYC or it's their first time (KYC is null)
      incompleteKyc.style.display = 'block';
      completeKycButton.style.display = 'block'; // Show button
    } else if (kycStatus === 'Pending') {
      // KYC data submitted, waiting for approval
      pendingKyc.style.display = 'block';
      completeKycButton.style.display = 'block'; // Show button
    } else if (kycStatus === 'Rejected') {
      // KYC has been rejected, user needs to re-upload
      rejectedKyc.style.display = 'block';
      completeKycButton.style.display = 'block'; // Show button
    } else if (kycStatus === 'Completed') {
      // KYC is completed
      completeKyc.style.display = 'block';
      // Hide "Complete KYC" button since KYC is already completed
      if (userKyc.userAggreementAccepted){
        completeKycButton.style.display = 'none'; 
      }
      else{
        completeKycButton.style.display = 'block'; 
      }
      
    }
  }
  
  