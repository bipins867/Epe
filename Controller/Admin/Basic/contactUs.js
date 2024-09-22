const ContactUs = require("../../../Models/Basic/contactUs");

// Get the count of pending and closed ContactUs requests
exports.getContactUsCounts = async (req, res) => {
  try {
    const pendingCount = await ContactUs.count({ where: { statusChecked: false } });
    const closedCount = await ContactUs.count({ where: { statusChecked: true } });

    res.status(200).json({
      pendingCount,
      closedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching ContactUs counts' });
  }
};

// Get all pending ContactUs requests
exports.getPendingContactUs = async (req, res) => {
  try {
    const pendingContacts = await ContactUs.findAll({ where: { statusChecked: false } });
    res.status(200).json(pendingContacts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pending ContactUs requests' });
  }
};


// Get all pending ApplyLoan applications
exports.getContactUsInfo = async (req, res) => {
  try {
    const id=req.params.id
    const contactUs = await ContactUs.findByPk(id);
    res.status(200).json(contactUs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching Contact Us Info' });
  }
};

// Get all closed ContactUs requests
exports.getClosedContactUs = async (req, res) => {
  try {
    const closedContacts = await ContactUs.findAll({ where: { statusChecked: true } });
    res.status(200).json(closedContacts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching closed ContactUs requests' });
  }
};

// Add admin remark to a ContactUs request
exports.addRemarkContactUs = async (req, res) => {
  const { id } = req.params; // ContactUs request ID
  const { adminRemark } = req.body;

  try {
    const contact = await ContactUs.findByPk(id);

    if (!contact) {
      return res.status(404).json({ error: 'ContactUs request not found' });
    }

    // Update the adminRemark and adminId
    contact.adminRemark = adminRemark;
    contact.statusChecked=true;
    contact.adminId = req.admin.userName;

    await contact.save();

    res.status(200).json({ message: 'Admin remark added successfully', contact });
  } catch (error) {
    res.status(500).json({ error: 'Error adding admin remark to ContactUs request' });
  }
};


