require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const { setupRoutes } = require("./Routes/setupRoutes");
const db = require("./database");
const User = require("./Models/User/users");
//const { sendOtp, sendKycSuccessfullMessage, sendRewardMessage, sendCreditMessage, sendDebitMessage } = require("./Utils/MailService");

require("./Models/setModels");
require("./Server-Socket/server");
require("./cronTimerFunctionController");




//sendOtp(6393070710,5555)
//sendKycSuccessfullMessage(6393070710)
//sendRewardMessage(6393070710,500)
//sendCreditMessage(6393070710,100,123456,'REF556',600)
//sendDebitMessage(6393070710,100,123456,'REF1234',600)

// Just check
app = express();
app.use(express.static(path.join(__dirname, "Public")));
app.use(express.static(path.join(__dirname, "CustomerFiles")));
app.use(express.static(path.join(__dirname, "CustomerSupport")));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(bodyParser.json({ extends: false }));

app.use("/getServerInfo", (req, res, next) => {
  return res
    .status(200)
    .json({
      socketPort: process.env.SOCKET_PORT,
      nodeEnv: process.env.NODE_ENV,
    });
});

app.use('/testWebsite',async (req,res,next)=>{

  try{
    const user=await User.findAll({limit:1})
    return res.json({message:`Current Time is :-  ${new Date()}`})
  }
  catch(err){
    return res.json({error:"Internal Server Error!"})
  }
})
setupRoutes(app);

db.sync()
  .then(() => {
    app.listen(process.env.APP_PORT);
    console.log(`Lisining to the port : ${process.env.APP_PORT}`);
  })
  .catch((err) => console.log(err));
