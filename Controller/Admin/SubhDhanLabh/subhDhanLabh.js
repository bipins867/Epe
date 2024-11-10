const TicketCard = require("../../../Models/SubhDhanLabh/ticketCard");
const { createAdminActivity } = require("../../../Utils/activityUtils");
const { Sequelize } = require("sequelize");
const path = require("path");
const { baseDir } = require("../../../importantSetup");

exports.createTicketCard = async (req, res, next) => {
  const { title, price } = req.body;
  const imageFile = req.files ? req.files[req.fileName][0] : null; // Assuming multer is used

  let transaction;

  try {
    // Check if a TicketCard with the same title already exists
    const existingTicketCard = await TicketCard.findOne({
      where: { title },
    });

    const commonPath = "CustomFiles";
    const pathCategory = "SubhDhanLabh";

    // Handle the image file if provided
    let urlImage = null;
    if (imageFile) {
      const filePath = path.join(baseDir, commonPath, pathCategory);
      const fileName = title;
      urlImage = saveFile(imageFile, filePath, fileName);
      urlImage = path.join(commonPath, pathCategory, urlImage);
      // Save the file and get the URL
    }

    if (existingTicketCard) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "A ticket card with this title already exists." });
    }

    transaction = await Sequelize.transaction();

    // Create the new TicketCard
    const newTicketCard = await TicketCard.create(
      { title, price, imageUrl: urlImage },
      { transaction }
    );

    // Log Admin Activity
    await createAdminActivity(
      req,
      req.admin,
      "subDhanLabh",
      `Admin ${req.admin.userName} created a new ticket card with title "${title}" and price "${price}".`,
      null,
      transaction
    );

    // Commit the transaction
    await transaction.commit();

    return res.status(201).json({
      message: "Ticket card created successfully.",
      ticketCard: newTicketCard,
    });
  } catch (error) {
    // Rollback transaction in case of any error
    if (transaction) await transaction.rollback();
    console.error("Error creating ticket card:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while creating the ticket card." });
  }
};
