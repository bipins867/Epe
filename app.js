require('dotenv').config()

const express=require('express')
const cors=require('cors')
const path=require('path')
const bodyParser=require('body-parser')


const { setupRoutes } = require('./Routes/setupRoutes')
const db = require("./database");

require('./Models/setModels')
require('./Server-Socket/server')

// Just check
app=express()
app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'CustomerFiles')));
app.use(express.static(path.join(__dirname,'CustomerSupport')))


app.use(cors({
    origin:'*',
    methods:['GET','POST']
}))

app.use(bodyParser.json({extends:false}))


app.use('/getServerInfo',(req,res,next)=>{

  return res.status(200).json({socketPort:process.env.SOCKET_PORT,nodeEnv:process.env.NODE_ENV})
})

setupRoutes(app);


db.sync()
  .then(() => {

    app.listen(process.env.APP_PORT);
    console.log(`Lisining to the port : ${process.env.APP_PORT}`)
  })
  .catch((err) => console.log(err));
