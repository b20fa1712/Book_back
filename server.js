const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const injectDb = require("./middleware/injectDb");
let cacheProvider = require("./middleware/cache/cache");
const request = require("request");
var proxy = require("express-http-proxy");
require("dotenv").config();
//Аппын тохиргоог process.env рүү ачааллах
dotenv.config({ path: "./config/config.env" });
const morgan = require("morgan");

connectDB();
// const db = require("./config/db-mysql");
const db = require("./models/index.js");
const { logger, accessLogStream } = require("./middleware/logger");
const errorHandler = require("./middleware/error");
// Router оруулж ирэх
const booksRoutes = require("./routes/books");
const usersRoutes = require("./routes/users");
var whitelist = ["http://localhost:3001/", "http://localhost:3002/"];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const app = express();

cacheProvider.start(function (err) {
  if (err) console.error(err);
});
app.use(express.json());
app.use(mongoSanitize());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(logger);

app.use(injectDb(db));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
// app.use(proxy());
// app.use("/api/v1/bo", proxy("www.mse.mn/mn/trade_today/23"));
app.use("/api/v1/books", booksRoutes);
app.use("/api/v1/users", usersRoutes);
app.use(errorHandler);

db.sequelize
  .sync()
  .then((result) => {
    // console.log(result);
    console.log("... sync хийгдэж дууслаа");
  })
  .catch((err) => console.log(err));

app.listen(4000, console.log(`Express server ${4000} deer aslaa!`));
