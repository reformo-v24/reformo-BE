const mongoose = require('mongoose');
const Igopool = require('../igopools/igoModel');
const Kycuser = require('../kycUsers/usersModel');
const SnapshotModel = require('../snapshot/snapshotModel')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const nodemailer = require('nodemailer');
const _ = require('lodash');
const Participateuser = require('./participateModel');
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const crypto = require('crypto');
const { google } = require("googleapis");


const FROM_MAIL = process.env.FROM_MAIL;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLEINT_SECRET = process.env.GOOGLE_CLEINT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;


function getCurrentTimestampSec() {
  const curr_date = new Date();
  return Math.floor(curr_date.getTime() / 1000);
}


const participateController = {}
 
  participatecontroller.updateDetails = async (req, res) => {
    const { _id, walletAddress } = req.body;
  
    try {
      // Convert _id to ObjectID
      const mongoose = require('mongoose');
      const igopoolDetails = await Igopool.findById(mongoose.Types.ObjectId(_id));
  
      const currTime = getCurrentTimestampSec();
  
      // Check if the pool time has started
      if (currTime < igopoolDetails.userRegister.startDate) {
        res.json({
          success: true,
          message: 'Pool participation has not started yet.',
        });
        return;
      }
  
      // Check if the pool time has ended
      if (currTime > igopoolDetails.userRegister.endDate) {
        res.json({
          success: true,
          message: 'Pool participation has ended.',
        });
        return;
      }
  
      // Fetch Kycuser details
      const kycuserDetails = await Kycuser.findOne({ walletAddress });
  
      // Check if the user is KYC verified
      if (kycuserDetails && kycuserDetails.kycStatus === 'approved') {
        // Fetch the Participateuser entry
        let participateUser = await Participateuser.findOne({ igoId: igopoolDetails._id });
  
        // If the Participateuser entry doesn't exist, create a new one
        if (!participateUser) {
          participateUser = new Participateuser({
            igoId: igopoolDetails._id,
            igoName: igopoolDetails.igoName,
          });
        }
  
        // Check if the user with the same wallet address has already participated
        const existingParticipant = participateUser.participants.find(
          (participant) => participant.walletAddress === kycuserDetails.walletAddress
        );
  
        if (existingParticipant) {
          // If the user has already participated, return an error response
          res.json({
            success: true,
            message: 'You have already participated in this igo pool.',
          });
          return;
        }
  
        // Push participant details with status set to true
        participateUser.participants.push({
          walletAddress: kycuserDetails.walletAddress,
          tier: kycuserDetails.tier,
          kycStatus: kycuserDetails.kycStatus,
          name: kycuserDetails.name,
          email: kycuserDetails.email,
          participateStatus: true, // Set status to true for new registrations
        });
  
        // Save the Participateuser entry
        await participateUser.save();
  
        // Return success response with pool ID and pool name
        res.json({
          success: true,
          message: 'Participant details registered successfully.',
          data: {
            igoId: participateUser.igoId,
            igoName: participateUser.igoName,
            participants: participateUser.participants,
          },
        });
      } else {
        // Return error response if user is not KYC verified
        res.json({
          success: false,
          message: 'User is not KYC verified.',
        });
      }
    } catch (error) {
      // Handle errors
      res.status(500).json({
        success: false,
        message: 'Error updating participant details.',
        error: error.message,
      });
    }
  }
  




  participateController.getParticipantsByIgoNameAndTier = async (req, res) => {
    const { igoName, tier } = req.params;

    try {
        // Fetch all Participateuser entries based on igoName
        const participantsByIgoName = await Participateuser.find({ igoName });

        if (participantsByIgoName.length > 0) {
            // Filter participants based on the specified tier
            const filteredParticipants = participantsByIgoName.flatMap(participant => {
                return participant.participants.filter(p => parseInt(p.tier.match(/\d+/)[0], 10) === parseInt(tier, 10));
            });

            if (filteredParticipants.length === 0) {
                return res.json({
                    success: false,
                    message: `No participants found for Tier ${tier} in the specified IgoName.`,
                });
            }

            // Extract relevant participant data for CSV
            const csvData = filteredParticipants.map(participant => ({
                name: participant.name,
                walletAddress: participant.walletAddress,
                email: participant.email,
                tier: parseInt(participant.tier.match(/\d+/)[0], 10),
            }));

            // Generate CSV file
            const csv = new ObjectsToCsv(csvData);
            const fileName = `${+new Date()}`;
            await csv.toDisk(`./lottery/tier${tier}-${fileName}.csv`);

            // Generate file hash
            const fileBuffer = fs.readFileSync(`./lottery/tier${tier}-${fileName}.csv`);
            const hashSum = crypto.createHash('sha256');
            hashSum.update(fileBuffer);
            const hex = hashSum.digest('hex');

            // Save snapshot record
            const snapshotRecord = new SnapshotModel({
                users: csvData,
                tier: tier,
                totalUsers: csvData.length,
                fileHash: hex,
            });
            await snapshotRecord.save();

                   // Send email with CSV attachment
        const oAuth2Client = new google.auth.OAuth2(
          CLIENT_ID,
          CLEINT_SECRET,
          REDIRECT_URI
        );         // Google Mail client
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
  
        const mailOptions = {
          from: FROM_MAIL,
          to: toAddress,
          subject: `CSV Data for Tier ${tier}`,
          text: `Attached is the CSV file with participant data for Tier ${tier}.`,
          attachments: [
            {
              filename: `participants_tier_${tier}.csv`,
              path: `./lottery/tier${tier}-${fileName}.csv`,
            },
          ],
        };
  
        await transporter.sendMail(mailOptions);

            return res.json({
                success: true,
                message: `CSV file for Tier ${tier} sent via email successfully.`,
            });
        } else {
            return res.json({
                success: false,
                message: 'No participants found for the specified IgoName.',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving participants by IgoName or sending email.',
            error: error.message,
        });
    }
};



participateController.getParticipationStatus = async (req, res) => {
  try {
    let { igoId, walletAddress } = req.params;
    // Convert walletAddress to lowercase
    walletAddress = walletAddress.toLowerCase();

    // Find the user by wallet address and IGOpool ID
    const participateUser = await Participateuser.findOne({
      igoId,
      'participants.walletAddress': walletAddress,
    });

    if (!participateUser) {
      // User not found or has not participated in the specified igo pool
      return res.status(200).json({
          participateStatus: false,
      });
    }

    // Check the participation status for the given wallet address and IGOpool ID
    const participant = participateUser.participants.find(
      (participant) => participant.walletAddress === walletAddress
    );

    // Return the participation status
    res.status(200).json({
      success: true,
      message: 'Participation status retrieved successfully.',
      data: {
        walletAddress: participant.walletAddress,
        participateStatus: participant.participateStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving participation status.',
      error: error.message,
    });
  }
}



module.exports = participateController;






