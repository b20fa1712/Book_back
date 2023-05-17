const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Номын нэрийг оруулна уу"],
    unique: true,
  },
  photo: { type: String, required: [true, "Номын зургийг оруулна уу"] },
  author: {
    type: String,
    required: [true, "Зохиогчийн нэрийг оруулна уу"],
  },

  price: {
    type: Number,
    required: [true, "Номны үнийг оруулна уу"],
    min: [500, "Номын үнэ хамгийн багадаа 500 төгрөг байх ёстой"],
  },
  // balance: Number,
  content: {
    type: String,
    required: [true, "Номын тайлбарыг оруулна уу"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Book", BookSchema);
