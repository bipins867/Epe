

document.addEventListener("DOMContentLoaded",async function() {

    const result=await getRequest('user/dashboard/post/info')
    
    const data=result.data;
    // Example user data
    const user = {
        name: data.name,
        kycCompleted: data.kycStatus // Change this to true if KYC is completed
    };

    // Display user's name
    const userNameElement = document.getElementById("userName");
    userNameElement.textContent = `Welcome, ${user.name}!`;

    // Show the appropriate KYC status bar
    const kycCompletedElement = document.getElementById("kycCompleted");
    const kycNotCompletedElement = document.getElementById("kycNotCompleted");
    const divKycComplete=document.getElementById('btn-kyc-complete')

    if (user.kycCompleted=='Completed') {
        kycCompletedElement.classList.remove("d-none");
        divKycComplete.classList.add('d-none')
    } else {
        kycNotCompletedElement.classList.remove("d-none");
        divKycComplete.classList.remove('d-none')
    }

    
    
});
