const http = require("http");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger-docs.json");

const Utils = require('./helper/utils');

require("dotenv").config();

// const tokenStatus = {
//   "0xA8c604F8475236dfD43CD96245a53F4dF7391Fb0": true,
//   "0x58Cd4ef2802AaEdecFd766C0da776b4b1774b97C": true,
// };

const options = {
  explorer: true,
};

process.env.TZ = "UTC";
const app = require("./config/app");

app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDoc, options));

app.get("/verify/:token", (req, res) => {
  const token = req.params.token;
  const isValid = tokenStatus[token];
  // return res.status(200).json({ status: isValid ? true : false });

  if (!isValid) return res.status(404).json({ status: false });

  return res.status(200).json({
    status: true,
    amount: 10000000000000000,
    address: req.params.token,
    byteData:
      "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000058cd4ef2802aaedecfd766c0da776b4b1774b97c",
  });

  // return res.status(200).json({
  //   RAW: {
  //     ETH: {
  //       USD: {
  //         VOLUME24HOUR: 108,
  //       },
  //     },
  //   },
  // });

  // return res.status(200).json({
  //   RAW: 107,
  // });
});

app.all('/*', (req, res) =>
  res.status(404).json({ status: false, message: 'Invalid Requests' })
);

http.createServer(app).listen(app.get("port"), () => {
  console.log(`REFORMA server listening on port ${app.get("port")}`);
  Utils.echoLog(`REFORMA server listening on port ${app.get("port")}`);
});
