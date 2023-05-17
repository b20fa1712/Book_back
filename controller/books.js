const Book = require("../models/Book");
const MyError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const paginate = require("../utils/paginate");

const NodeCache = require("node-cache");

//  Бүх номыг авах
const myCache = new NodeCache({ stdTTL: 35990000 });

exports.getBo = asyncHandler(async (req, res, next) => {
  const select = req.query.select;

  [("select", "limit", "page", "sort")].forEach((el) => delete req.query[el]);
  if (myCache.get("myCache") != undefined) {
    res.status(200).json({
      success: true,
      count: "books.length",
      data: myCache.get("myCache"),
    });
  } else {
    const books = await Book.find(req.query, select);

    myCache.set("myCache", books, 10000000000);
    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  }
});

//mainbook
exports.getBooks = asyncHandler(async (req, res, next) => {
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const select = req.query.select;

  [("select", "limit", "page", "sort")].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Book);
  const books = await Book.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  myCache.set("myCache", books, 10000000000);
  res.status(200).json({
    success: true,
    count: books.length,
    data: books,
  });
});

exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError(req.params.id + "ID-тай ном байхгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: book,
  });
});

//Шинээр ном үүсгэх
exports.createBook = asyncHandler(async (req, res, next) => {
  const book = await Book.create(req.body);

  res.status(200).json({
    success: true,
    data: book,
  });
});
// Номын мэдээлэл засах
exports.updateBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError((req.params.id + "iim ID-tai ном bhgveee.", 400));
  }
  for (let attr in req.body) {
    // for in давталт ашиглаж шинэчлэх хэсгийн талбаруудыг attr аар гаргаж байна
    book[attr] = req.body[attr];
  }

  book.save();

  res.status(200).send({
    success: true,
    data: book,
    message: req.params.id + "successfull UPDATE!!!",
  });
});

exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new MyError(req.params.id + "ID-тай ном байхгүй", 400);
  }

  book.remove();

  res.status(200).json({
    success: true,
    data: book,
    message: "successfull DELETE man .. ",
  });
});
