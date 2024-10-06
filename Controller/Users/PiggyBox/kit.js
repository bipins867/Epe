exports.getUserInfo = async (req, res, next) => {
    try {
      // Extract candidateId and name from the authenticated user's info
      const { candidateId, name } = req.user;
  
      // Return the user info
      return res.status(200).json({
        candidateId,
        name,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
  };
  