const Sequelize = require("sequelize");

// Custom logging function for errors only
const logErrors = (msg) => {
  if (msg instanceof Error) {
    console.error("Sequelize Error: ", msg);
  }
};

console.log(`Database connected : ${process.env.DATABASE_NAME}`);

module.exports = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.DATABASE_HOST,
    logging: logErrors, // Log errors only in production
  }
);
