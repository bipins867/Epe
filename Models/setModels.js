//User-Models
const User=require('./User/users');
const UserKyc = require('./Kyc/userKyc');


const Admin=require('./User/admins')
const Role=require('./User/role')
const AdminAndRole=require('./User/adminAndRole')



User.hasOne(UserKyc)
UserKyc.belongsTo(User);


Admin.belongsToMany(Role, { through: AdminAndRole, foreignKey: 'AdminId' });
Role.belongsToMany(Admin, { through: AdminAndRole, foreignKey: 'RoleId' });
