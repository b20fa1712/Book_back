const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const moment = require("moment");

const getCookieOptions = () => {
  return {
    expires: moment().add(2, "h").utc(8).toDate(),
    httpOnly: process.env.COOKIE_ENV === "development" ? true : false,
    secure: process.env.COOKIE_ENV === "development" ? false : true,
    sameSite: process.env.COOKIE_ENV === "development" ? null : "none",
  };
};

//   #####  ######  #######    #    ####### #######
//  #     # #     # #         # #      #    #
//  #       #     # #        #   #     #    #
//  #       ######  #####   #     #    #    #####
//  #       #   #   #       #######    #    #
//  #     # #    #  #       #     #    #    #
//   #####  #     # ####### #     #    #    #######

exports.createUser = asyncHandler(async (req, res, next) => {
  req.body.action = "create user";

  const user = await req.db.user.create(req.body);

  user.password = "";

  res.status(200).json({
    success: true,
    data: user,
  });
});

//  #     # ######  ######     #    ####### #######
//  #     # #     # #     #   # #      #    #
//  #     # #     # #     #  #   #     #    #
//  #     # ######  #     # #     #    #    #####
//  #     # #       #     # #######    #    #
//  #     # #       #     # #     #    #    #
//   #####  #       ######  #     #    #    #######

exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await req.db.user.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`Хэрэглэгч олдсонгүй.`, 400);
  }

  user = await user.update(req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
});

//  ######  #######  #####  ####### ######  ####### #     #
//  #     # #       #     #    #    #     # #     #  #   #
//  #     # #       #          #    #     # #     #   # #
//  #     # #####    #####     #    ######  #     #    #
//  #     # #             #    #    #   #   #     #    #
//  #     # #       #     #    #    #    #  #     #    #
//  ######  #######  #####     #    #     # #######    #

exports.destroyUser = asyncHandler(async (req, res, next) => {
  let user = await req.db.user.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`Хэрэглэгч олдсонгүй`, 400);
  }

  user = await user.destroy(req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
});

//   #####  ####### #######
//  #     # #          #
//  #       #          #
//  #  #### #####      #
//  #     # #          #
//  #     # #          #
//   #####  #######    #

exports.getUser = asyncHandler(async (req, res, next) => {
  let user = await req.db.user.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`main_error_user_not_found`, 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//    ##   #      #
//   #  #  #      #
//  #    # #      #
//  ###### #      #
//  #    # #      #
//  #    # ###### ######

exports.getAllUser = asyncHandler(async (req, res, next) => {
  // console.log("first log is >>", req.db);
  let user = await req.db.user.findAll();
  res.status(200).json({
    success: true,
    data: user,
  });
});

//  #       #######  #####  ### #     #
//  #       #     # #     #  #  ##    #
//  #       #     # #        #  # #   #
//  #       #     # #  ####  #  #  #  #
//  #       #     # #     #  #  #   # #
//  #       #     # #     #  #  #    ##
//  ####### #######  #####  ### #     #

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Оролтыг шалгана
  if (!email || !password) {
    throw new MyError("Та мэйл болон нэр ээ оруулна уу", 400);
  }

  //Тухайн хэрэглэгчийг хайна
  const user = await req.db.user
    .scope("withPassword")
    .findOne({ where: { email: email } });

  // if (user?.status === "9") {
  //   throw new MyError("Таны хэрэглэгчийн эрх хүрэхүй байна", 400);
  // }

  if (!user) {
    throw new MyError(`Хэрэглэгч олдсонгүй та бүртгэл ээ үүсгэнэ үү`, 400);
  }
  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Нууц үг таарахгүй байна", 401);
  }

  const token = user.getJsonWebToken();

  // var updateUser = await req.db.user.findByPk(user.id);
  // updateUser.action = "login";
  // await updateUser.save();
  // if (user?.status === "9") {
  //   const shareholder1 = await req.db.shareholder.findOne({
  //     where: { id: shareholder?.id },
  //   });
  //   shareholder1.userId = user.id;
  //   await shareholder1.save();
  // }
  user.password = "";

  // var cookieOptions = getCookieOptions();

  res.status(200).cookie("token", token).json({
    success: true,
    accessToken: token,
    data: {
      user,
    },
  });
});

//  ######  #######  #####  ###  #####  ####### ####### ######
//  #     # #       #     #  #  #     #    #    #       #     #
//  #     # #       #        #  #          #    #       #     #
//  ######  #####   #  ####  #   #####     #    #####   ######
//  #   #   #       #     #  #        #    #    #       #   #
//  #    #  #       #     #  #  #     #    #    #       #    #
//  #     # #######  #####  ###  #####     #    ####### #     #

exports.register = asyncHandler(async (req, res, next) => {
  if (!req.body) {
    throw new MyError("Та бүртгэлийн мэдээлэл ээ оруулна уу.", 400); //Та регистрын дугаараа илгээнэ үү.
  }
  const { email } = req.body;
  var exUser = await req.db.user.findOne({ where: { email: email } });

  if (!exUser) {
    req.body.status = "9";
    var user = await req.db.user.create(req.body);
  } else {
    throw new MyError(`${exUser.email} Энэ хэрэглэгч бүртгэлтэй байна.`, 400);
  }

  user.password = null;
  user.confirmationToken = null;
  user.confirmationTokenExpire = null;

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    accessToken: token,
    // data: {
    //   user,
    // },
  });
});

//  #       #######  #####  ####### #     # #######
//  #       #     # #     # #     # #     #    #
//  #       #     # #       #     # #     #    #
//  #       #     # #  #### #     # #     #    #
//  #       #     # #     # #     # #     #    #
//  #       #     # #     # #     # #     #    #
//  ####### #######  #####  #######  #####     #

exports.logout = asyncHandler(async (req, res, next) => {
  cookieOption = {
    expires: moment().subtract(2, "h").utc(8).toDate(),
    httpOnly: false,
    secure: true,
    sameSite: "none",
  };

  res.status(200).cookie("token", null, cookieOption).json({
    success: true,
    data: "Logged out",
  });
});
