// const bcrypt = require("bcrypt-node");
const crypto = require("crypto");

var hashPassword = (user) => {
  console.log("HASH PASSWORD USER: ", user);
  try {
    if (user.password) {
      var salt = crypto.randomBytes(16).toString("hex");
      console.log("SALT: ", salt);

      var password = crypto
        .pbkdf2Sync(user.password, salt, 1000, 64, `sha512`)
        .toString(`hex`);
      console.log("PASSWORD: ", password);
      user.password = password;
      user.salt = salt;
    }
  } catch (err) {
    throw new Error("Error on hash password", 500);
  }
};

module.exports = hashPassword;
