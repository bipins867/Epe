const Announcement = require("../../Models/Basic/announcement");
const ApplyLoan = require("../../Models/Basic/applyLoan");
const ContactUs = require("../../Models/Basic/contactUs");
const Newsletter = require("../../Models/Basic/newsLetter");

// Controller function to handle ContactUs form submission
exports.submitContactUs = async (req, res) => {
  try {
    // Extracting data from the request body
    const { name, email, phoneNumber, reasonForContact } = req.body;

    // Validating required fields
    if (!name || !email || !phoneNumber || !reasonForContact) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Creating a new ContactUs entry
    const contactUsEntry = await ContactUs.create({
      name,
      email,
      phoneNumber,
      reasonForContact,
      statusChecked: false, // Default value for statusChecked
    });

    return res.status(201).json({
      message: "ContactUs form submitted successfully!",
      data: contactUsEntry,
    });
  } catch (error) {
    console.error("Error in submitting ContactUs form:", error);
    return res.status(500).json({
      message: "Server error while submitting ContactUs form.",
      error: error.message,
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
      return res.status(400).json({ message: "All fields are required." });
    }

    // Creating a new ApplyLoan entry
    const loanEntry = await ApplyLoan.create({
      name,
      email,
      phoneNumber,
      loanType,
      reasonForLoan,
      statusChecked: false, // Default value for statusChecked
    });

    return res.status(201).json({
      message: "Loan application submitted successfully!",
      data: loanEntry,
    });
  } catch (error) {
    console.error("Error in submitting ApplyLoan form:", error);
    return res.status(500).json({
      message: "Server error while submitting loan application.",
      error: error.message,
    });
  }
};

exports.subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email already exists in the newsletter
    const existingSubscription = await Newsletter.findOne({ where: { email } });

    if (existingSubscription) {
      // Email already subscribed
      return res.status(200).json({
        message: "You are already subscribed to the newsletter!",
        subscribed: true,
      });
    }

    // If email is not subscribed, create a new subscription
    const newSubscription = await Newsletter.create({ email });

    return res.status(201).json({
      message: "Subscription successful!",
      subscription: newSubscription,
      subscribed: true,
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return res.status(500).json({
      message: "An error occurred while subscribing to the newsletter.",
      error: error.message,
    });
  }
};

exports.getAllActiveAnnouncments = async (req, res) => {
  try {
    // Fetch all active announcements
    const activeAnnouncements = await Announcement.findAll({
      where: {
        isActive: true, // Only get announcements that are active
      },
      order: [["createdAt", "DESC"]], // Order by the most recent announcements
    });

    // Return the active announcements
    return res.status(200).json({
      success: true,
      message: "Active announcements retrieved successfully.",
      data: activeAnnouncements,
    });
  } catch (error) {
    console.error("Error fetching active announcements:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching active announcements.",
      error: error.message,
    });
  }
};
