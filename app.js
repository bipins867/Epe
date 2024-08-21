require('dotenv').config()

const express=require('express')
const cors=require('cors')
const path=require('path')
const bodyParser=require('body-parser')

// Just check
app=express()

app.use(cors({
    origin:'*',
    methods:['GET','POST']
}))
app.use(bodyParser.json({extends:false}))







app.listen(process.env.APP_PORT)