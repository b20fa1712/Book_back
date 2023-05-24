require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: "",
    database: "books",
    host: "0.tcp.jp.ngrok.io",
    port: "16088",
    dialect: "mysql",
    operatorsAliases: process.env.DB_OPERATOR,
    timezone: "+08:00",
  },
  test: {
    username: "root",
    password: "",
    database: "books",
    host: "0.tcp.jp.ngrok.io",
    port: "16088",
    dialect: "mysql",
    operatorsAliases: process.env.DB_OPERATOR,
    logging: process.env.DB_LOGGING,
    timezone: "+08:00",
    dialectOptions: {
      useUTC: false, // for reading from database
    },
  },
  production: {
    username: "root",
    password: "",
    database: "books",
    host: "0.tcp.jp.ngrok.io",
    port: "16088",
    dialect: "mysql",
    operatorsAliases: process.env.DB_OPERATOR,
    timezone: "+08:00",
  },
};
// module.exports = {
//   development: {
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: process.env.DB_DIALECT,
//     operatorsAliases: process.env.DB_OPERATOR,
//     timezone: "+08:00",
//   },
//   test: {
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: process.env.DB_DIALECT,
//     operatorsAliases: process.env.DB_OPERATOR,
//     logging: process.env.DB_LOGGING,
//     timezone: "+08:00",
//     dialectOptions: {
//       useUTC: false, // for reading from database
//     },
//   },
//   production: {
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: process.env.DB_DIALECT,
//     operatorsAliases: process.env.DB_OPERATOR,
//     timezone: "+08:00",
//   },
// };
