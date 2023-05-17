const User = require("../models/sequelize/user");
const asyncHandler = require("../middleware/asyncHandler"); //Өөрөө бичсэн нь
const MyError = require("../utils/myError");
// const path = require("path");
// const paginate = require("../utils/paginate");
// const sandEmail = require("../utils/email");
const crypto = require("crypto");

//Register

exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});

//Login

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Оролт шалгах

  if (!email || !password) {
    throw new MyError("Имайл болон нууц үг ээ хийнэ үү!!", 400);
  }

  //Тухайн хэрэглэгчийг хайна

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new MyError("Имэйл юмуу нууц үг ээ зөв хийнэ үү!!1", 401);
  }
  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Имэйл юмуу нууц үг ээ зөв хийнэ үү!!1", 401);
  }

  const token = user.getJsonWebToken();
  const CookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // mls bolgj bn 1 = 1000
  };

  res.status(200).cookie("Amazon-token", token, CookieOption).json({
    success: true,
    login: true,
    token,
    user: user,
  });
});

// api/v1/
exports.getUsers = asyncHandler(async (req, res, next) => {
  const sort = req.query.sort; // sort
  // const page = parseInt(req.query.page) || 1; // page
  const limit = parseInt(req.query.limit) || 10; // limit
  const select = req.query.select; // select (name or price gh mt)
  // delete req.query.select;

  ["select", "limit", "page", "sort"].forEach((el) => delete req.query[el]); // Давталт ашиглаж delete хийх

  //Pagination
  // const pagination = await paginate(page, limit, User);

  const users = await User.find(req.query, select)

    .sort(sort)
    // .skip(pagination.start - 1)
    .limit(limit); // bvgdiin haih;

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
    // pagination,
  });
});

// api/v1/
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + "ID-тай хэрэглэгч байхгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//Шинээр хэрэглэгч үүсгэх
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
});

//Хэрэглэгчийн мэдээллийг өөрчлөх

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    name: true,
    runValidators: true,
  });

  if (!user) {
    throw new MyError(req.params.id + "ID-тай хэрэглэгч байхгүй", 400);
  }

  // req.body.createUser = req.userId;

  res.status(200).json({
    success: true,
    data: user,
  });
});

//Хэрэглэгч устгах

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + "ID-тай хэрэглэгч байхгүй", 400);
  }

  // const user = await User.findById(req.userId);

  user.remove();

  res.status(200).json({
    success: true,
    data: user,
    // whoDelete: user,
    message: "successfull DELETE man .. ",
  });
});

//forgot-password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError("Та нууц үг дамжуулах имэйл хаяг аа дамжуулна уу", 400);
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new MyError(req.params.id + "Имэйл хаягтай хэрэглэгч олдсонгүй", 400);
  }

  const resetToken = user.generatePasswordChangeToken();
  await user.save();

  // await user.save({ validateBeforeSave: false });
  //Email ilgeene

  const link = `http://amazon.mn/changepassword/${resetToken} `;

  const message = `Сайн байна уу? <br><br> Та нууц үг солих хүсэлт илгээлээ. <br> Нууц үг ээ доорх линк дээр дарж солино уу:<br><br>${link}<br><br> Өдрийг сайхан өнгөрүүлээрэй!`;

  const info = await sandEmail({
    email: user.email,
    subjetc: "Нууц үг өөрчлөх хүсэлт",
    message,
  });

  console.log("Message sent: %s", info.messageId);

  res.status(200).json({
    success: true,
    data: resetToken,
  });
});
//reset-password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.resetToken) {
    throw new MyError("Та нууц үг болон токен оо дамжуулна уу", 400);
  }

  const encrypted = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new MyError("Токен хүчингүй байна", 400);
  }

  user.password = req.body.password;
  resetPasswordToken = undefined;
  resetPasswordExpire = undefined;
  user.save();

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});
