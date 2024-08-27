const baseUrl='http://localhost:3000/'

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const emailOrPhone=document.getElementById('emailOrPhone').value
    const password=document.getElementById('password').value

    let obj;
    if ( emailOrPhone.includes('@')){
        const email=emailOrPhone;
        obj={email,password}
    }
    else{
        const phone=emailOrPhone;
        obj={phone,password}
    }

   
    
    
    
    
    try{
        const result=await axios.post(baseUrl+'userAuthentication/post/login',obj)
       // window.location.replace('/userAuthentication/login');

            alert('Login Successfull!')
    }
    catch(err){
       
        
        const response=await err.response.data

        if (response.errors){
          
            let err=''
           Object.keys(response.errors).forEach(er=>{
                err=err+response.errors[er]+'\n'
            })
            alert(err);
        }
        else{
            
           if (response.message){
            alert(response.message)

           }
           else{
            alert(response.error);
           }
        }
        
    }    
});