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
const cookieParser = require("cookie-parser");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");
const axios = require("axios");
// import jwt from "jsonwebtoken";
//Oautgh settings
const redirectURI = "auth/google";

function getGoogleAuthURL() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `${process.env.SERVER_ROOT_URI}/${redirectURI}`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  // return `${
  //   "<11111>" +
  //   process.env.SERVER_ROOT_URI +
  //   "<22222>" +
  //   redirectURI +
  //   "<33333>" +
  //   process.env.GOOGLE_CLIENT_ID
  // }`;
  return `${rootUrl}?${querystring.stringify(options)}`;
}

function getTokens({ code, clientId, clientSecret, redirectUri }) {
  console.log("getToken ajilsn");

  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  return axios
    .post(url, querystring.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch auth tokens`);
      throw new Error(error.message);
    });
}

//end Oauth
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
app.use(cookieParser());

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
//OA

app.get("/api/v1/auth/google/url", (req, res) => {
  // console.log("first");
  return res.send(getGoogleAuthURL());
  // return res.send("first");
});

app.get(`/api/v1/${redirectURI}`, async (req, res) => {
  const code = req.query.code;

  const { id_token, access_token } = await getTokens({
    code,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${process.env.SERVER_ROOT_URI}/${redirectURI}`,
  });

  // Fetch the user's profile with the access token and bearer
  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch user`);
      throw new Error(error.message);
    });

  // console.log("Мэдээлэл", googleUser);

  const token = jwt.sign(googleUser, process.env.JWT_SECRET);

  res.cookie(process.env.COOKIE_NAME, token, {
    maxAge: 900000,
    httpOnly: true,
    secure: false,
  });

  res.redirect(process.env.UI_ROOT_URI);
});

app.get("/api/v1/auth/me", (req, res) => {
  console.log("get me");
  try {
    const decoded = jwt.verify(
      req.cookies[process.env.COOKIE_NAME],
      process.env.JWT_SECRET
    );
    console.log("decoded", decoded);
    return res.send(decoded);
  } catch (err) {
    console.log(err);
    res.send(null);
  }
});

//OA end
app.use("/api/v1/bo", proxy("www.mse.mn/mn/trade_today/23"));
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
