const pagesRouter=require('./Pages/pages')
const adminRouter=require('./Admin/admin')
const kycRouter=require('./Kyc/kyc')
const userAuthenticationRouter=require('./UserAuthentication/userAuthentication')

exports.setupRoutes=(app)=>{
    app.use('/userAuthentication',userAuthenticationRouter)
    app.use('/admin',adminRouter)
    app.use('/kyc',kycRouter)
    app.use('/',pagesRouter);
}