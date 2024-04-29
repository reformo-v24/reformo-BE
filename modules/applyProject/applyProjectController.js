const applyProjectModel = require('./applyProjectModel')
const Utils = require('../../helper/utils')
const applyProjCtr = {}

applyProjCtr.addApplyProject = async (req, res) => {
  try {
    const newProject = new applyProjectModel(req.body)
    await newProject.save()

    return res.status(200).json({
      message: 'Project added successfully',
      status: true
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ status: false, message: error.message })
  }
}

applyProjCtr.listAppliedProjects = async (req, res) => {
  try {
    const query = {}
    if (req.query.approved) {
      query.approvalStatus = 'approved'
    }
    const appliedProjects = await applyProjectModel.find(query)
    return res.status(200).json({
      message: 'Projects list fetched successfully.',
      status: true,
      data: appliedProjects
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ status: false, message: error.message })
  }
}

applyProjCtr.updateAppliedStatus = async (req, res) => {
  try {
    const { approvalStatus, reason } = req.body
    const updates = {}

    const findIDO = await applyProjectModel.findById({ _id: req.params.ID })

    updates.approvalStatus = approvalStatus
    if (reason) updates.reason = reason

    if (findIDO.approvalStatus === 'approved') {
      return res.status(409).json({
        message: 'Project has already been approved.',
        status: false
      })
    } else if (findIDO.approvalStatus === 'rejected') {
      return res.status(409).json({
        message: 'Sorry, Cannot update project as it has been rejected.',
        status: false
      })
    } else if (findIDO.approvalStatus === 'pending') {
      const updatedProject = await applyProjectModel.findOneAndUpdate(
        { _id: req.params.ID },
        updates,
        { new: true }
      )

      if (updatedProject) {
        const html = `
            <html>
            <table width="800" style="border:1px solid #333">
                <tr>
                    <td align="center">
                    <h5>
                        ||--------REFORMA IDO PLATFORM : PROJECT APPROVAL & REJECTION--------||
                    </h5>
                        <h4>
                            This message is to notify you about IDO project's status. Kindly consider the status and do actions as per need!
                        </h4>
                    </td>
                </tr>
                <tr>
                    <td align="center">
                        <table align="center" width="400" border="0" cellspacing="2" cellpadding="2" style="border:1px solid #ccc; margin-top: 10px; margin-bottom: 10px;">
                            <tr>
                                <td> <b>IDO Name</b> </td>
                                <td>${findIDO.projectName}</td>
                            </tr>
                            <tr>
                                <td> <b>Project Status</b> </td>
                                <td>${approvalStatus}</td>
                            </tr>
                            
                            <tr>
                                <td> <b>Comment | Reason</b> </td>
                                <td>${reason}</td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
            <h4>
                Thanks & Regards,
            </h4>
            <h4>
                Team,
            </h4>
            <h4>
                Blocsys Technologies
            </h4>        
            </html>
            `

        Utils.sendUserNotification(
          `${html} \n `,
          `IDO project approval and rejection notification...`,
          findIDO.email
        )
      }
      return res.status(200).json({
        message: 'Project updated successfully',
        status: true,
        data: updatedProject
      })
    }
  } catch (error) {
    Utils.echoLog(error)
    return res.status(500).json({ status: false, message: error.message })
  }
}

module.exports = applyProjCtr
