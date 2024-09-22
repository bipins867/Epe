const ApplyLoan = require("../../../Models/Basic/applyLoan");

// Get the count of pending and closed ApplyLoan applications
exports.getApplyLoanCounts = async (req, res) => {
  try {
    const pendingCount = await ApplyLoan.count({ where: { statusChecked: false } });
    const closedCount = await ApplyLoan.count({ where: { statusChecked: true } });

    res.status(200).json({
      pendingCount,
      closedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching ApplyLoan counts' });
  }
};


// Get all pending ApplyLoan applications
exports.getPendingApplyLoan = async (req, res) => {
  try {
    const pendingLoans = await ApplyLoan.findAll({ where: { statusChecked: false } });
    res.status(200).json(pendingLoans);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pending ApplyLoan applications' });
  }
};

// Get all pending ApplyLoan applications
exports.getApplyLoanInfo = async (req, res) => {
  try {
    const id=req.params.id
    const applyLoan = await ApplyLoan.findByPk(id);
    res.status(200).json(applyLoan);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching Apply Loan Info' });
  }
};



// Get all closed ApplyLoan applications
exports.getClosedApplyLoan = async (req, res) => {
  try {
    const closedLoans = await ApplyLoan.findAll({ where: { statusChecked: true } });
    res.status(200).json(closedLoans);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching closed ApplyLoan applications' });
  }
};

// Add admin remark to an ApplyLoan application
exports.addRemarkApplyLoan = async (req, res) => {
  const { id } = req.params; // Loan application ID
  const { adminRemark } = req.body;

  try {
    const loan = await ApplyLoan.findByPk(id);

    if (!loan) {
      return res.status(404).json({ error: 'ApplyLoan application not found' });
    }

    // Update the adminRemark and adminId
    loan.adminRemark = adminRemark;
    loan.statusChecked=true;
    loan.adminId = req.admin.userName;

    await loan.save();

    res.status(200).json({ message: 'Admin remark added successfully', loan });
  } catch (error) {
    res.status(500).json({ error: 'Error adding admin remark to ApplyLoan application' });
  }
};


