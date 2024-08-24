const pagesRouter=require('./Pages/pages')
const adminRouter=require('./Admin/admin')


exports.setupRoutes=(app)=>{
    app.use('/admin',adminRouter)
    app.use('/',pagesRouter);
}