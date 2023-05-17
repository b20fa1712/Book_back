let request = require("request");
let cacheProvider = require("./cache");
const CACHE_DURATION = 600;
const CACHE_KEY = "CACHE_KEY";

exports.myCacheableRequest = function (cb) {
  cacheProvider.instance().get(CACHE_KEY, function (err, value) {
    if (err) console.error(err);
    if (value == undefined) {
      request.get("/api/v1/news.json", function (err, response, body) {
        let res = JSON.parse(res.body);

        cacheProvider
          .instance()
          .set(CACHE_KEY, res, CACHE_DURATION, function (err, success) {
            if (!err && success) {
              cb(res);
            }
          });
      });
    } else {
      cb(value);
    }
  });
};
