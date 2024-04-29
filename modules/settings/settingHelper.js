const settingModel = require('./settingModel');


exports.addSnapshotEmail = async (emailsList) => {
    let newEmailList;
    const oldEmailsList = await this.getSnapshotEmails();

    if(oldEmailsList){
        newEmailList = await settingModel.updateOne({}, {$addToSet:{ ReformaMailAddress : emailsList}});
    }
    else{
        newEmailList = await settingModel.create({ ReformaMailAddress : emailsList, ccMailAddress: [] });
    }

    return newEmailList;
}

exports.addccEmail = async (emailsList) => {
    let newEmailList;
    const oldEmailsList = await this.getccEmails();

    if(oldEmailsList){
        newEmailList = await settingModel.updateOne({}, {$addToSet:{ ccMailAddress : emailsList}});
    }
    else{
        newEmailList = await settingModel.create({ ccMailAddress : emailsList, ReformaMailAddress: [] });
    }

    return newEmailList;
}

exports.getSnapshotEmails = async () => {
    const snapshotEmails = await settingModel.find({}, ['ReformaMailAddress']);
    if(!snapshotEmails.length)
        return undefined;

    return snapshotEmails[0].ReformaMailAddress;
}

exports.getccEmails = async () => {
    const ccEmails = await settingModel.find({}, ['ccMailAddress']);
    if(!ccEmails.length)
        return undefined;

    return ccEmails[0].ccMailAddress;
}

// module.exports = settingHelper;

