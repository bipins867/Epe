const Sequelize = require("sequelize");

console.log(`Database connected : ${process.env.DATABASE_NAME}`);
module.exports = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.DATABASE_HOST,
    logging: console.log,
  }
);
