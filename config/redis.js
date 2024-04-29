const asyncRedis = require("async-redis");

let url = "";
if (process.env.NODE_ENV == "production") {
  url = { url: process.env.REDIS_URL };
}

console.log("Redis connecting", url);
const client = asyncRedis.createClient(url);

module.exports = client;
