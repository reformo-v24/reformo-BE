const utils = require('excel4node/distribution/lib/utils');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Utils = require('../helper/utils');

const url = process.env.MONGO_URL;

mongoose
  .connect(`${url}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((res) => {
  
    console.log('database connected successfully');
    Utils.echoLog('database connected successfully');
  })
  .catch((error) => {
    console.log('error in connecting with database ', error);
    Utils.echoLog('error in connecting with database ', error);
  });
