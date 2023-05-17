// Алдааг барьж аваад мэдээллэх
const errorHandler = (err, req, res, next) => {
  console.log("ERROR бол:" + err);

  const error = { ...err };

  error.message = err.message;

  if (error.name == "CastError") {
    error.message = "Энэ ID буруу бүтэцтэй байна";
    error.statusCode = 400;
  }
  if (error.name == "JsonWebTokenError" && error.message == "invalid token") {
    error.message = "Буруу токен дамжуулсан байна.";
    error.statusCode = 400;
  }
  if (error.name == "JsonWebTokenError" && error.message == "jwt malformed") {
    error.message = "Та дахин нэвтрэнэ үү";
    error.statusCode = 400;
  }
  if (error.message == "jwt malformed") {
    error.message = "Та дахин нэвтрэнэ үү";
    error.statusCode = 400;
  }
  if (error.code == 11000) {
    error.message = "Энэ талбарын утга давхардаж байна!!!"; //err.message байхгүй байсан тул error obj бичив
    error.statusCode = 400;
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error,
  });
};
module.exports = errorHandler;
