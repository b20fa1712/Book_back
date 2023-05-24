const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(
    "mongodb+srv://Mygmarsaikhan:MC2002MCc!@cluster0.7ox6oem.mongodb.net/test",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  console.log(`MongoDB холбогдлоо: ${conn.connection.host}`);
};

module.exports = connectDB;
