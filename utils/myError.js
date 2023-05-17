// 2 төрөлийн алдаа байсан ба түүнийг нийлсэн болно

class MyError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.stutasCode = statusCode;
  }
}

module.exports = MyError;
