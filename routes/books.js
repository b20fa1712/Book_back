//imports

const express = require("express");

const { protect, authorize } = require("../middleware/protect");

const {
  getBooks,
  getBo,
  getBook,
  createBook,
  deleteBook,
  updateBook,
} = require("../controller/books");

const router = express.Router();

//---/api/v1/books/---
router.route("/").get(getBooks).post(protect, authorize("0", "1"), createBook);
router
  .route("/:id")
  .get(getBook)
  .delete(protect, authorize("0", "1"), deleteBook)
  .put(protect, authorize("0", "1"), updateBook);

module.exports = router;
