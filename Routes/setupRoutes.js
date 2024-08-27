const pagesRouter=require('./Pages/pages')
const adminRouter=require('./Admin/admin')
//const kycRouter=require('./Kyc/kyc')
const userAuthenticationRouter=require('./UserAuthentication/userAuthentication')
const userRouter=require('./User/user')

exports.setupRoutes=(app)=>{
    app.use('/user',userRouter)
    app.use('/userAuthentication',userAuthenticationRouter)
    app.use('/admin',adminRouter)
    //app.use('/kyc',kycRouter)
    app.use('/',pagesRouter)
}