let express = require("express");
const NodeCache = require("node-cache");

app = express();
const port = 3000;

const myCache = new NodeCache({ stdTTL: 35990000 });
let DAT;

// const books = await Book.find(req.query, select);
// DAT = myCache.get("myCache");
const Cache = () => {
  console.log("first");
  if (myCache.get("myCache") != undefined) {
    console.log("cache нээс авж байна. ");
    DAT = myCache.get("myCache");
  } else {
    const Value = "Cache ажиллаж байна";
    const Value1 = "Баазаас өгөгдөл авлаа.";
    DAT = Value1;
    console.log("llll");

    myCache.set("myCache", Value, 10000000000);
  }
};

app.get("/", (req, res) => {
  Cache();
  res.send(DAT);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
