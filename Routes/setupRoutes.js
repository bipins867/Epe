const pagesRouter=require('./Pages/pages')
const adminRouter=require('./Admin/admin')
//const kycRouter=require('./Kyc/kyc')
const userRouter=require('./User/user')
const fileRouter=require('./Files/files')


exports.setupRoutes=(app)=>{
    app.use('/user',userRouter)
    app.use('/files',fileRouter)
    app.use('/admin',adminRouter)
    //app.use('/kyc',kycRouter)
    app.use('/',pagesRouter)
}