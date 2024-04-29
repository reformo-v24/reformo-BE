const nodemailer = require('nodemailer');
const winston = require('../config/winston');
// const emailJson = require("./email.json");
const { google } = require("googleapis");
const Web3 = require("web3");
const solanaWeb3 = require("@solana/web3.js");
const fs = require("fs");
const ObjectsToCsv = require("objects-to-csv");
// const sendgrid = require("./email");
require("dotenv").config();

const settingHelper = require("../modules/settings/settingHelper");
const utils = {};
const FROM_MAIL = process.env.FROM_MAIL;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLEINT_SECRET = process.env.GOOGLE_CLEINT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

utils.sendEmail = async (data, message, email) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLEINT_SECRET,
      REDIRECT_URI
    );         // Google Mail client
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const accessToken = await oAuth2Client.getAccessToken();

    if (data.length) {
      const csv = new ObjectsToCsv(data);
      const fileName = +new Date();
      await csv.toDisk(`./csv/${fileName}.csv`);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "rohit@blocsys.com",
          clientId: CLIENT_ID,
          clientSecret: CLEINT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });
      const content = fs
        .readFileSync(`./csv/${fileName}.csv`)
        .toString("base64");
      let attachments = [
        {
          // path: `./csv/${fileName}.csv`,
          filename: `${fileName}.csv`,
          content,
          type: "application/pdf",
          disposition: "attachment",
        },
      ];

      let mailContent = {
        from: FROM_MAIL,
        to: email,
        subject: message,
        text: message,
        attachments:attachments,
      };
      // sendMail(mailContent);

      transporter.sendMail(mailContent, function (error, data) {
        if (error) {
          utils.echoLog('Unable to send mail', error)
        }
        if (data) {
          utils.echoLog("Email send successfully");
        }
      });
    } else {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "rohit@blocsys.com",
          clientId: CLIENT_ID,
          clientSecret: CLEINT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      let mailContent = {
        from: "rohit@blocsys.com",
        to: email,
        subject: message,
        text: "No transaction found for specified block number",
      };
      // sendMail(mailContent);

      transporter.sendMail(mailContent, function (error, data) {
        if (error) {
          utils.echoLog('Unable to send mail', error)
        }
        if (data) {
          utils.echoLog("Email send successfully");
        }
      });
    }
  } catch (err) {
    utils.echoLog('error in catch',err)
  }
};

utils.echoLog = (...args) => {
  if (process.env.SHOW_LOG === "true") {
    try {
      // eslint-disable-next-line no-undef
      winston.info(args);
    } catch (e) {
      // eslint-disable-next-line no-undef
      winston.log(e);
    }
  }
  // }
};

utils.empty = (mixedVar) => {
  let key;
  let i;
  let len;
  const emptyValues = ["undefined", null, false, 0, "", "0"];
  for (i = 0, len = emptyValues.length; i < len; i++) {
    if (mixedVar === emptyValues[i]) {
      return true;
    }
  }
  if (typeof mixedVar === "object") {
    for (key in mixedVar) {
      return false;
    }
    return true;
  }

  return false;
};

utils.sendSnapshotEmail = async (
  location,
  fileName,
  subject,
  message,
  format,
  ...attachments
) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLEINT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "rohit@blocsys.com",
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    let snapshotEmail = await settingHelper.getSnapshotEmails();
    let ccEmail = await settingHelper.getccEmails();

    let attachment = [];
    const content = fs.readFileSync(location);
    attachment.push({
      filename: `${fileName}.${format ? format : "xlsx"}`,
      content,
      type: "application/pdf",
      disposition: "attachment",
    });
    if (attachment.length) {
      for (let i = 0; i < attachment.length; i++) {
        if (attachment[i].filename) {
          // let newContent = fs.readFileSync(location).toString("base64");
          // let extraAttachment = {
          //   filename: attachment[0].filename,
          //   content: newContent,
          //   type: "application/pdf",
          //   disposition: "attachment",
          // };
          // attachment.push(extraAttachment);
        }
      }
    }
    let mailContent = {
      from: FROM_MAIL,
      to: snapshotEmail,
      subject: subject,
      text: message,
      cc: ccEmail,
      attachments: attachment,
    };
    // sendMail(mailContent);

    transporter.sendMail(mailContent, function (error, data) {
      if (error) {
        utils.echoLog("Unable to send mail", error)
      }
      if (data) {
        utils.echoLog('Email send successfully')
        // fs.unlink(location, ()=>{
        //   console.log(`remove ${location}`)
        // })
      }
    });
  } catch (err) {
    utils.echoLog("error in sendSnapshotEmail", err)
  }
};

utils.convertToEther = (number) => {
  if (number) {
    let value = parseFloat(Web3.utils.fromWei(number)).toFixed(5);

    return +value;
  } else {
    return 0;
  }
};

utils.convertToWei = (number) => {
  if (number) {
    let value = Web3.utils.toWei(number);
    return value;
  } else {
    return 0;
  }
};

utils.toTruncFixed = (value, n) => {
  return toTrunc(value, n).toFixed(n);
};

function toTrunc(value, n) {
  const x = (value.toString() + ".0").split(".");
  return parseFloat(x[0] + "." + x[1].substr(0, n));
}

utils.checkAddressForSolana = async (address) => {
  try {
    const pubKey = new solanaWeb3.PublicKey(address);
    const checkisTrue = solanaWeb3.PublicKey.isOnCurve(pubKey);

    if (checkisTrue) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

utils.sendFromalEmail = async (text, subject) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLEINT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "rohit@blocsys.com",
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    let snapshotEmail = await settingHelper.getSnapshotEmails();
    let ccEmail = await settingHelper.getccEmails();

    let mailContent = {
      from: FROM_MAIL,
      to: snapshotEmail,
      subject: subject,
      text: text,
      cc: ccEmail,
    };
    // sendMail(mailContent);

    transporter.sendMail(mailContent, function (error, data) {
      if (error) {
        utils.echoLog('Unable to send mail', error)
      }
      if (data) {
        utils.echoLog('Email send successfully')
      }
    });
  } catch (err) {
    utils.echoLog("Unable to send mail - ", err.message);
    throw new Error("Unable to send mail - ", err.message);
  }
};

utils.sendUserNotification = async (html, subject, emails) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLEINT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "rohit@blocsys.com",
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    let mailContent = {
      from: FROM_MAIL,
      to: emails,
      subject: subject,
      html: html,
    };
    // sendMail(mailContent);

    transporter.sendMail(mailContent, function (error, data) {
      if (error) {
        utils.echoLog('Unable to send mail', error)
      }
      if (data) {
        utils.echoLog('Email send successfully')
      }
    });
  } catch (err) {
    utils.echoLog("Unable to send mail - ", err.message);
    throw new Error("Unable to send mail - ", err.message);
  }
};
//toDo : snedGrid snapshot mail
// async function sendMail(mailContent) {
//   sendgrid
//     .send(mailContent)
//     .then(() => {
//       console.log("Email sent");
//       return true;
//     })
//     .catch((error) => {
//       console.error(error.response.body);
//       console.error(error.message);
//       return false;
//     });
// }

module.exports = utils;
