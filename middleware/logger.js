/**
 * logger
 */
exports.logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.hostname}${req.originalUrl}`.cyan
  );
  next();
};

const rfs = require("rotating-file-stream");
const path = require("path");
const fs = require("fs");

/**
 * access log
 */
exports.accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: path.join(__dirname, "../log"),
});

exports.frcLogStream = async (data) => {
  var stream = fs.createWriteStream(__dirname + "/../log/frc.log", {
    flags: "a",
  });
  stream.once("open", function (fd) {
    stream.write(data + "\r\n");
  });
};

exports.frcErrLogStream = async (data) => {
  var stream = fs.createWriteStream(__dirname + "/../log/frc_err.log", {
    flags: "a",
  });
  stream.once("open", function (fd) {
    stream.write(data + "\r\n");
  });
};
