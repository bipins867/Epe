//User-Models
const User=require('./User/users');
const UserKyc = require('./Kyc/userKyc');


const Admin=require('./User/admins')
const Role=require('./User/role')
const AdminAndRole=require('./User/adminAndRole')


const CaseUser=require('./CustomerSupport/caseUser')
const CaseMessage=require('./CustomerSupport/caseMessage')
const CustomerCase=require('./CustomerSupport/customerCase')



User.hasOne(UserKyc)
UserKyc.belongsTo(User);


Admin.belongsToMany(Role, { through: AdminAndRole, foreignKey: 'AdminId' });
Role.belongsToMany(Admin, { through: AdminAndRole, foreignKey: 'RoleId' });


CaseUser.hasOne(CustomerCase)
CustomerCase.belongsTo(CaseUser)

CustomerCase.hasMany(CaseMessage)
CaseMessage.belongsTo(CustomerCase)