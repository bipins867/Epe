require('dotenv').config()

const express=require('express')
const cors=require('cors')
const path=require('path')
const bodyParser=require('body-parser')

const { setupRoutes } = require('./Routes/setupRoutes')
const db = require("./database");
require('./Models/setModels')

// Just check
app=express()
app.use(express.static(path.join(__dirname, 'Public')));


app.use(cors({
    origin:'*',
    methods:['GET','POST']
}))

app.use(bodyParser.json({extends:false}))



setupRoutes(app);


db.sync()
  .then(() => {

    app.listen(process.env.APP_PORT);
    console.log(`Lisining to the port : ${process.env.APP_PORT}`)
  })
  .catch((err) => console.log(err));
