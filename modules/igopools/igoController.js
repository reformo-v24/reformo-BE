const igoModel = require("./igoModel");
const schedule = require("node-schedule");
const web3Helper = require("../../helper/web3Helper");
const Utils = require('../../helper/utils');

const igoController = {};
const eliminationFields =
  "-phases -socialLinks -decimal -abi_name -token_address -__v -createdAd -updatedAd";

function getCurrentTimestampSec() {
  const curr_date = new Date();
  return Math.floor(curr_date.getTime() / 1000);
}


igoController.igoUpCommingList = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const curr_timestamp_sec = getCurrentTimestampSec();
    const nxt_timestamp_sec = curr_timestamp_sec + 24 * 60 * 60;

    const upcomingPools = await igoModel
      .find({
        poolStatus: "upcoming",
        'phases.start_date': { $gte: curr_timestamp_sec },
      })
      .select(eliminationFields)
      .skip((+page - 1) * +process.env.LIMIT)
      .limit(+process.env.LIMIT)
      .lean();

    const totalUpcoming = await igoModel.countDocuments({
      poolStatus: "upcoming",
      'phases.start_date': { $gte: curr_timestamp_sec },
    });
    const pageCount = Math.ceil(totalUpcoming / +process.env.LIMIT);

    return res.status(200).json({
      status: true,
      message: "IGO pools upcoming list",
      data: upcomingPools,
      pagination: {
        totalCount: totalUpcoming,
        pageCount,
        pageNo: page,
        pageLimit: process.env.LIMIT || 10,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      err: error.message ? error.message : error,
    });
  }
};




igoController.liveIGO = async (req, res) => {
  try {
    const curr_timestamp_sec = getCurrentTimestampSec();
    const page = req.query.page ? req.query.page : 1;

    const liveIgoData = await igoModel.find({
      'userRegister.startDate': { $lt: curr_timestamp_sec },
      'userRegister.endDate': { $gt: curr_timestamp_sec },
    })
      .select(eliminationFields)
      .skip((+page - 1) * +process.env.LIMIT)
      .limit(+process.env.LIMIT)
      .lean();

    if (liveIgoData.length > 0) {
    
      await igoModel.updateMany(
        { _id: { $in: liveIgoData.map(igo => igo._id) } },
        { $set: { poolStatus: "Enrolling" } }
      );
    }

    const totalLive = await igoModel.countDocuments({
      poolStatus: "Enrolling",
    });
    const pageCount = Math.ceil(totalLive / +process.env.LIMIT);


    return res.status(200).json({
      message: 'Success',
      status: true,
      data: liveIgoData,
      pagination: {
        totalCount: totalLive,
        pageCount,
        pageNo: page,
        pageLimit: process.env.LIMIT || 10,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Some error occurred',
      status: false
    });
  }
};


igoController.igoLiveCompletedList = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const curr_timestamp_sec = getCurrentTimestampSec();

    const liveCompletedPools = await igoModel.find({
      'userRegister.endDate': { $lt: curr_timestamp_sec },
      'phases.start_date': { $gt: curr_timestamp_sec },
    })
      .select(eliminationFields)
      .skip((+page - 1) * +process.env.LIMIT)
      .limit(+process.env.LIMIT)
      .lean();

    // Check if there are any pools to update to "completed"
    if (liveCompletedPools.length > 0) {
      // Update the status of these pools to "completed"
      await igoModel.updateMany(
        { _id: { $in: liveCompletedPools.map(igo => igo._id) } },
        { $set: { poolStatus: "RegCompleted" } }
      );
    }

    const totalIgoCompleted = await igoModel.countDocuments({
      poolStatus: "RegCompleted",
    });
    const pageCount = Math.ceil(totalIgoCompleted / +process.env.LIMIT);

    return res.status(200).json({
      status: true,
      message: "IGO pools completed list",
      data: liveCompletedPools,
      pagination: {
        totalCount: totalIgoCompleted,
        pageCount,
        pageNo: page,
        pageLimit: process.env.LIMIT || 10,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      err: error.message ? error.message : error,
    });
  }
};



// add the pool status Active.
igoController.igoFeaturedList = async (req, res) => {
  try {
    const curr_date = new Date();
    const curr_timestamp_sec = Math.floor(curr_date.getTime() / 1000);

    const featuredPools = await igoModel.find({
      'phases': {
        $elemMatch: {
          $and: [
            { 'start_date': { $lt: curr_timestamp_sec } },
            { 'end_date': { $gt: curr_timestamp_sec } },
          ]
        }
      }
    });

    // Update the status of these pools to "Active"
    await igoModel.updateMany(
      { _id: { $in: featuredPools.map(igo => igo._id) } },
      { $set: { poolStatus: "Active" } }
    );

    return res.status(200).json({
      status: true,
      message: "IGO pools featured list",
      data: featuredPools,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Error in database",
      err: error.message ? error.message : error,
    });
  }
};



// add the pool status completed.
igoController.igoCompletedList = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const curr_timestamp_sec = getCurrentTimestampSec();

    // Find all pools
    const allPools = await igoModel.find();

    // Iterate through pools
    for (const pool of allPools) {
      let poolStatus = "upcoming"; // Default status

      // Check each phase
      for (const phase of pool.phases) {
        if (phase.end_date < curr_timestamp_sec) {
          // Phase has ended
          poolStatus = "completed";
        } else if (phase.start_date < curr_timestamp_sec && phase.end_date > curr_timestamp_sec) {
          // Phase is active
          poolStatus = "Active";
          break; // No need to check further phases if one is active
        }
      }

      // Update the pool status in the database
      await igoModel.updateOne({ _id: pool._id }, { $set: { poolStatus } });
    }

    // Retrieve the updated list of completed pools
    const completedPools = allPools.filter(pool => pool.poolStatus === "completed");

    const totalCompleted = completedPools.length;
    const pageCount = Math.ceil(totalCompleted / +process.env.LIMIT);

    return res.status(200).json({
      status: true,
      message: "IGO pools completed list",
      data: completedPools,
      pagination: {
        totalCount: totalCompleted,
        pageCount,
        pageNo: page,
        pageLimit: process.env.LIMIT || 10,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      err: error.message ? error.message : error,
    });
  }
};







igoController.getSingleIGO = async (req, res) => {
  try {
    const igoId = req.params.id;
    if (!igoId)
      return res.status(400).json({
        status: false,
        message: "Please provide a valid igopool id",
      });

    const data = await igoModel
      .findOne({ _id: igoId })
      .select("-__v -createdAt -updatedAt");

    if (!data) {
      return res.status(404).json({
        status: false,
        message: "IGO not found for the provided id",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Single IGO details",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Error in database",
      err: error.message ? error.message : error,
    });
  }
};







igoController.igoCreate = async (req, res) => {
  try {
    const igoData = { ...req.body, poolStatus: "upcoming" };

    if (igoData.phases && igoData.phases.length > 0) {
      igoData.phases.forEach((phase, index) => {
        igoData.phases[index].poolStatus = "upcoming";
      });
    }

    const newIGOPools = new igoModel(igoData);

    await newIGOPools.save();

    return res.status(200).json({
      Status: true,
      Message: "IGOpools Created Successfully",
      Data: newIGOPools,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Error in database",
      err: error.message ? error.message : error,
    });
  }
};



igoController.editIgo = async (req, res) => {
  try {
    const igoId = req.body._id;
    const data = req.body;
    delete data._id;

    const newIgo = await igoModel.findOneAndUpdate({ _id: igoId }, data, {
      new: true,
    });

    if (!newIgo) {
      return res.status(404).json({
        status: true,
        message: "IGO not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "IGO updated successfully",
      data: newIgo,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Error in database",
      err: error.message ? error.message : error,
    });
  }
};

 //toDo: This is the actual code, commented for test purpose
// igoController.scheduleTodayIgoCron = async (req, res) => {
//   try {  
//     const curr_timestamp_sec = getCurrentTimestampSec();
    
//     const igosToday = await igoModel.find({
//       $and: [
//         { "phases.start_date": { $lte: curr_timestamp_sec } },
//         { "phases.end_date": { $gt: curr_timestamp_sec } },
//       ],
//     });

//     igosToday.forEach((igo) => {
//       igo.phases.forEach((phase) => {
//         if (phase.start_date <= curr_timestamp_sec) {
//           // let timeString = getCronTimeString(start_date);
//           let start_time = new Date(phase.start_date * 1000);
//           let end_time = new Date(phase.end_date * 1000);
//           schedule.scheduleJob(
//             { start: start_time, end: end_time, rule: "*/1 * * * *" },
//             async () => {
//               await scheduleIgoCron(phase.
//                 phaseContractAddress
//                 , igo._id, phase._id);
//             }
//           );
//           console.log(start_time + " -- Cron Set");
//         }
//       });
//     });

//     return res.status(200).json(igosToday);
//   } catch (error) {
//     console.log(error);
//     Utils.echoLog("Error while scheduling IGO Cron", error);
//     if (res) {
//       return res.status(500).json({
//         status: false,
//         message: "Error in database",
//         err: error.message ? error.message : error,
//       });
//     } else {
//       console.error("Response object 'res' is undefined.");
//     }
//   }
// };

// async function scheduleIgoCron(contract_address, igo_id, phase_id) {
//   try {
//     let hasFilled = await web3Helper.hasIgoFilled(contract_address);
//     if (hasFilled.status) {
//       let data = await igoModel.findOne({ _id: igo_id });

//       let phase = data.phases.id(phase_id);
//       console.log(phase);
//       phase["poolStatus"] = "completed";
//       phase["totalRaisedAllphaseocation"] = hasFilled.totalRaised;

//       data.poolStatus = "completed";
//       await data.save();  
//     }
//   } catch (error) {
//     Utils.echoLog('Error occured while finding igoFilled in scheduleIgoCron',error);
//     // eslint-disable-next-line no-undef
//     // if (res) 
//       // eslint-disable-next-line no-undef
//       return res.status(500).json({
//         status: false,
//         message: "Error in database",
//         err: error.message ? error.message : error,
//       });
//   }
// }


//toDO: Service for test purpose. Delete after test

igoController.listAllIGOs = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;

    const IGOModel = await igoModel.find({});

    const allIGOCount = igoModel.countDocuments

    const pageCount = Math.ceil(allIGOCount / +process.env.LIMIT);

    return res.status(200).json({
      status: true,
      message: "All IGO pools list",
      data: IGOModel,
      pagination: {
        totalCount: allIGOCount,
        pageCount,
        pageNo: page,
        pageLimit: process.env.LIMIT || 10,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "something went wrong",
      err: error.message ? error.message : error,
    });
  }
};

module.exports = igoController;