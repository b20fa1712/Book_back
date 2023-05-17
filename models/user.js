const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt-node");
const crypto = require("crypto");
const moment = require("moment");
const hashPassword = require("../utils/hashPassword");
("use strict");

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "9",
        validate: {
          isIn: {
            args: [["0", "1", "9"]],
            msg: "Define user status",
          },
        },
      },
      firstName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      confirmationToken: DataTypes.STRING,
      confirmationTokenExpire: DataTypes.DATE,
      salt: DataTypes.STRING,
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      sequelize,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
      scopes: {
        withPassword: {
          attributes: {
            include: ["password"],
          },
        },
      },
    }
  );

  //  ######  ####### ####### ####### ######  #######
  //  #     # #       #       #     # #     # #
  //  #     # #       #       #     # #     # #
  //  ######  #####   #####   #     # ######  #####
  //  #     # #       #       #     # #   #   #
  //  #     # #       #       #     # #    #  #
  //  ######  ####### #       ####### #     # #######

  user.beforeCreate(hashPassword);
  user.beforeUpdate(hashPassword);

  //   #####  ####### ####### ####### ####### #    # ####### #     #
  //  #     # #          #       #    #     # #   #  #       ##    #
  //  #       #          #       #    #     # #  #   #       # #   #
  //  #  #### #####      #       #    #     # ###    #####   #  #  #
  //  #     # #          #       #    #     # #  #   #       #   # #
  //  #     # #          #       #    #     # #   #  #       #    ##
  //   #####  #######    #       #    ####### #    # ####### #     #

  user.prototype.getJsonWebToken = function () {
    const token = jwt.sign(
      { id: this.id, status: this.status },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    return token;
  };

  //   #####  #     # #######  #####  #    # ######     #     #####   #####  #     # ####### ######  ######
  //  #     # #     # #       #     # #   #  #     #   # #   #     # #     # #  #  # #     # #     # #     #
  //  #       #     # #       #       #  #   #     #  #   #  #       #       #  #  # #     # #     # #     #
  //  #       ####### #####   #       ###    ######  #     #  #####   #####  #  #  # #     # ######  #     #
  //  #       #     # #       #       #  #   #       #######       #       # #  #  # #     # #   #   #     #
  //  #     # #     # #       #     # #   #  #       #     # #     # #     # #  #  # #     # #    #  #     #
  //   #####  #     # #######  #####  #    # #       #     #  #####   #####   ## ##  ####### #     # ######

  user.prototype.checkPassword = async function (password) {
    console.log("THIS SALT: ", this.salt);
    console.log("PASSWORD: ", password);
    console.log("THIS PASSWORD: ", this.password);

    var hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
      .toString(`hex`);

    console.log("HASH: ", hash);

    return this.password === hash;
  };

  //   #####  ####### #     #  #####  #     #    #    #     #  #####  ####### ####### ####### #    # ####### #     #
  //  #     # #       ##    # #     # #     #   # #   ##    # #     # #          #    #     # #   #  #       ##    #
  //  #       #       # #   # #       #     #  #   #  # #   # #       #          #    #     # #  #   #       # #   #
  //  #  #### #####   #  #  # #       ####### #     # #  #  # #  #### #####      #    #     # ###    #####   #  #  #
  //  #     # #       #   # # #       #     # ####### #   # # #     # #          #    #     # #  #   #       #   # #
  //  #     # #       #    ## #     # #     # #     # #    ## #     # #          #    #     # #   #  #       #    ##
  //   #####  ####### #     #  #####  #     # #     # #     #  #####  #######    #    ####### #    # ####### #     #

  user.prototype.generatePasswordChangeToken = function () {
    const resetToken = crypto.randomBytes(30).toString("hex");

    console.log("RESET TOKEN: ", resetToken);

    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.resetPasswordExpire = moment().add(2, "h").utc(8).format();
    console.log("RESET TOKEN: ", this.resetPasswordToken);
    console.log("RESET TOKEN: ", this.resetPasswordExpire);

    return resetToken;
  };

  //  ######  #######  #####  ####### ####### ######     #     #####   #####  #     # ####### ######  ######
  //  #     # #       #     # #          #    #     #   # #   #     # #     # #  #  # #     # #     # #     #
  //  #     # #       #       #          #    #     #  #   #  #       #       #  #  # #     # #     # #     #
  //  ######  #####    #####  #####      #    ######  #     #  #####   #####  #  #  # #     # ######  #     #
  //  #   #   #             # #          #    #       #######       #       # #  #  # #     # #   #   #     #
  //  #    #  #       #     # #          #    #       #     # #     # #     # #  #  # #     # #    #  #     #
  //  #     # #######  #####  #######    #    #       #     #  #####   #####   ## ##  ####### #     # ######

  user.prototype.resetPassword = async function (password) {};

  //   #####  ####### #     # #     # #     # #     # ######  ####### ######
  //  #     # #       ##    # ##    # #     # ##   ## #     # #       #     #
  //  #       #       # #   # # #   # #     # # # # # #     # #       #     #
  //  #  #### #####   #  #  # #  #  # #     # #  #  # ######  #####   ######
  //  #     # #       #   # # #   # # #     # #     # #     # #       #   #
  //  #     # #       #    ## #    ## #     # #     # #     # #       #    #
  //   #####  ####### #     # #     #  #####  #     # ######  ####### #     #

  user.prototype.generateConfirmationNumber = function () {
    const confimationNumber = Math.floor(Math.random() * 999999);

    this.confirmationToken = crypto
      .createHash("sha256")
      .update(JSON.stringify(confimationNumber))
      .digest("hex");
    this.confirmationTokenExpire = moment().add(2, "h").utc(8).format();

    return confimationNumber;
  };

  //   #####  ####### #     #  #####  ####### #     # ####### ####### ####### #    # ####### #     #
  //  #     # #       ##    # #     # #     # ##    # #          #    #     # #   #  #       ##    #
  //  #       #       # #   # #       #     # # #   # #          #    #     # #  #   #       # #   #
  //  #  #### #####   #  #  # #       #     # #  #  # #####      #    #     # ###    #####   #  #  #
  //  #     # #       #   # # #       #     # #   # # #          #    #     # #  #   #       #   # #
  //  #     # #       #    ## #     # #     # #    ## #          #    #     # #   #  #       #    ##
  //   #####  ####### #     #  #####  ####### #     # #          #    ####### #    # ####### #     #

  user.prototype.generateConfirmationToken = function () {
    const confirmationToken = crypto.randomBytes(30).toString("hex");

    this.confirmationToken = crypto
      .createHash("sha256")
      .update(confirmationToken)
      .digest("hex");
    this.confirmationTokenExpire = moment().add(2, "h").utc(8).format();

    return confirmationToken;
  };

  return user;
};
