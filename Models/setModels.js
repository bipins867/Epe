//User-Models
const User=require('./User/users');


const UserKyc = require('./Kyc/userKyc');



User.hasOne(UserKyc)
UserKyc.belongsTo(User);