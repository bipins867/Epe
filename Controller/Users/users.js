const User = require("../../Models/User/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.userSignUp = async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists. Please log in instead." }); // 409 Conflict
    }

    // Hash the password before saving
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res
          .status(500)
          .json({ message: "Internal server error. Please try again later." });
      }

      // Create the new user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
      });

      return res
        .status(201)
        .json({ message: "SignUp Successful", userId: newUser.id }); // 201 Created
    });
  } catch (err) {
    console.error("Error during user sign-up:", err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.userLogin = async (req, res, next) => {
  const { email, phone, password } = req.body;

  try {
    // Check if the user exists
    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    } else {
      user = await User.findOne({ where: { phone } });
    }

    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" }); // 404 Not Found
    }

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res
          .status(500)
          .json({ error: "Internal server error. Please try again later." });
      }

      if (isMatch) {
        // Generate a JWT token
        const token = jwt.sign(
          { name: user.name, id: user.id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "2h", // Optional: specify token expiration time
          }
        );

        return res
          .status(200)
          .json({ status: "Login Successful", token, userId: user.id }); // 200 OK
      } else {
        return res.status(401).json({ error: "Invalid Password" }); // 401 Unauthorized
      }
    });
  } catch (err) {
    console.error("Error during user login:", err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
