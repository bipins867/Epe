const ApplyLoan = require("../../../Models/Basic/applyLoan");
const ContactUs = require("../../../Models/Basic/contactUs");



// Controller function to update ContactUs by Admin
exports.updateContactUsByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // ContactUs ID from URL params
    const { adminRemark, statusChecked } = req.body; // Admin input data

    // Find the ContactUs entry by ID
    const contactUsEntry = await ContactUs.findByPk(id);

    if (!contactUsEntry) {
      return res.status(404).json({ message: 'ContactUs entry not found.' });
    }

    // Update the entry with admin's remark and statusChecked value
    contactUsEntry.adminId=req.admin.userName
    contactUsEntry.adminRemark = adminRemark || contactUsEntry.adminRemark;
    contactUsEntry.statusChecked = statusChecked !== undefined ? statusChecked : contactUsEntry.statusChecked;

    // Save changes to the database
    await contactUsEntry.save();

    return res.status(200).json({
      message: 'ContactUs entry updated successfully!',
      data: contactUsEntry
    });
  } catch (error) {
    console.error('Error updating ContactUs entry:', error);
    return res.status(500).json({
      message: 'Server error while updating ContactUs entry.',
      error: error.message
    });
  }
};




// Controller function to update ApplyLoan by Admin
exports.updateApplyLoanByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // ApplyLoan ID from URL params
    const { adminRemark, statusChecked } = req.body; // Admin input data

    // Find the ApplyLoan entry by ID
    const loanEntry = await ApplyLoan.findByPk(id);

    if (!loanEntry) {
      return res.status(404).json({ message: 'Loan application not found.' });
    }

    // Update the entry with admin's remark and statusChecked value
    loanEntry.adminId=req.admin.userName
    loanEntry.adminRemark = adminRemark || loanEntry.adminRemark;
    loanEntry.statusChecked = statusChecked !== undefined ? statusChecked : loanEntry.statusChecked;

    // Save changes to the database
    await loanEntry.save();

    return res.status(200).json({
      message: 'Loan application updated successfully!',
      data: loanEntry
    });
  } catch (error) {
    console.error('Error updating loan application:', error);
    return res.status(500).json({
      message: 'Server error while updating loan application.',
      error: error.message
    });
  }
};


