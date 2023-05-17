const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    // console.log("Надад хэрэгтэй мэдээлэл", req.headers.authorization);
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies["token"];
  }

  // console.log("auth hreader: ", req.cookies["token"]);
  console.log("protect token is here: ", token);

  if (!token) {
    throw new MyError(
      " Энэ үйлдэл хийхэд таны эрх хүрэхгүй байна. Та эхлээд нэвтэрч орно уу",
      409
    ); //Permission denied, please login.
  }

  const tokenObj = jwt.verify(token, process.env.JWT_SECRET);

  console.log("CURRENT TOKEN OBJ: ", tokenObj);

  req.userId = tokenObj.id;
  req.userStatus = tokenObj.status;

  req.userRole = tokenObj.role;
  console.log("REQUEST USER: ", req.userId);
  console.log("REQUEST USER STATUS: ", req.userStatus);
  next();
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userStatus)) {
      throw new MyError(
        "Your [" +
          req.userStatus +
          "] permission has been denied to do this action",
        403
      );
    }
    next();
  };
};
