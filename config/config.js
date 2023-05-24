const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  mongoUri:
    "mongodb+srv://Mygmarsaikhan:MC2002MCc!@cluster0.7ox6oem.mongodb.net/test" ||
    "mongodb+srv://Mygmarsaikhan:MC2002MCc!@cluster0.7ox6oem.mongodb.net/test" ||
    "mongodb+srv://Mygmarsaikhan:MC2002MCc!@cluster0.7ox6oem.mongodb.net/test",
};
