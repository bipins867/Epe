require('dotenv').config()

const express=require('express')
const cors=require('cors')
const path=require('path')
const bodyParser=require('body-parser')
const { setupRoutes } = require('./Routes/setupRoutes')

// Just check
app=express()
app.use(express.static(path.join(__dirname, 'Public')));


app.use(cors({
    origin:'*',
    methods:['GET','POST']
}))

app.use(bodyParser.json({extends:false}))



setupRoutes(app);



app.listen(process.env.APP_PORT)