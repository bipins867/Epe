const pagesRouter=require('./Pages/pages')

exports.setupRoutes=(app)=>{

    app.use('/',pagesRouter);
}