const SavedAddress = require("../../../Models/PiggyBox/savedAddress");
const { createUserActivity } = require("../../../Utils/activityUtils");
const sequelize=require('../../../database')


exports.getSavedAddress = async (req, res, next) => {
  try {
    // Fetch the saved address using the user ID
    const savedAddress = await SavedAddress.findOne({ where: { UserId: req.user.id } });

    if (!savedAddress) {
      return res.status(404).json({ message: "No saved address found." });
    }

    // Return the saved address
    return res.status(200).json({ savedAddress });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};


exports.updateSavedAddress = async (req, res, next) => {
    const { address1, address2, state, pinCode } = req.body; // Extract saved address details from request body

    let transaction;
    try {
      // Fetch existing saved address
      const existingSavedAddress = await SavedAddress.findOne({ where: { UserId: req.user.id } });
  

      transaction = await sequelize.transaction();

      if (existingSavedAddress) {
        // Update the existing saved address
        await existingSavedAddress.update({
          address1,
          address2,
          state,
          pinCode,
        },{transaction});

        await createUserActivity(
          req,
          req.user,
          "savedAddress",
          "Updated the saved address information!",
          transaction
        );

        await transaction.commit();
  
        return res.status(200).json({ message: "Saved address updated successfully.", savedAddress: existingSavedAddress });
      } else {
        // Create new saved address if it does not exist
        const newSavedAddress = await SavedAddress.create({
          UserId: req.user.id, // Associate with the user
          address1,
          address2,
          state,
          pinCode,
        },{transaction});

        await createUserActivity(
          req,
          req.user,
          "savedAddress",
          "Created the saved address information!",
          transaction
        );


        await transaction.commit();
  
        return res.status(201).json({ message: "Saved address created successfully.", savedAddress: newSavedAddress });
      }
    } catch (err) {
      if(transaction){
        await transaction.rollback();
      }
      console.error(err);
      return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };
  