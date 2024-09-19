const ApplyLoan = require("../../Models/Basic/applyLoan");
const ContactUs = require("../../Models/Basic/contactUs");



// Controller function to handle ContactUs form submission
exports.submitContactUs = async (req, res) => {
  try {
    // Extracting data from the request body
    const { name, email, phoneNumber, reasonForContact } = req.body;

    // Validating required fields
    if (!name || !email || !phoneNumber || !reasonForContact) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Creating a new ContactUs entry
    const contactUsEntry = await ContactUs.create({
      name,
      email,
      phoneNumber,
      reasonForContact,
      statusChecked: false // Default value for statusChecked
    });

    return res.status(201).json({
      message: 'ContactUs form submitted successfully!',
      data: contactUsEntry
    });
  } catch (error) {
    console.error('Error in submitting ContactUs form:', error);
    return res.status(500).json({
      message: 'Server error while submitting ContactUs form.',
      error: error.message
    });
  }
};





// Controller function to handle ApplyLoan form submission
exports.submitApplyLoan = async (req, res) => {
  try {
    // Extracting data from the request body
    const { name, email, phoneNumber, loanType, reasonForLoan } = req.body;

    // Validating required fields
    if (!name || !email || !phoneNumber || !loanType || !reasonForLoan) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Creating a new ApplyLoan entry
    const loanEntry = await ApplyLoan.create({
      name,
      email,
      phoneNumber,
      loanType,
      reasonForLoan,
      statusChecked: false // Default value for statusChecked
    });

    return res.status(201).json({
      message: 'Loan application submitted successfully!',
      data: loanEntry
    });
  } catch (error) {
    console.error('Error in submitting ApplyLoan form:', error);
    return res.status(500).json({
      message: 'Server error while submitting loan application.',
      error: error.message
    });
  }
};

