const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../helpers/auth");

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Email received:", email); //debugging

  try {
    const user = await Admin.findOne({ email });
    //check if email exist
    if (!user) {
      console.log("User not found with email:", email); //debugging
      return res.status(400).json({ message: "Invalid credentialsw" });
    }

    console.log("Password received:", password); //debugging
    console.log("Password hash stored:", user.password_hash); //debugging

    //check if password is correct
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ message: "Invalid  credentialse" });
    }
    // Update last_login field with current date
    user.last_login = new Date();
    await user.save();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      path: '/',
    });

    res.status(200).json({ message: "Logged in successfully" });
    console.log(token);
    console.log("Login Successfulllllalslals"); //debugging
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { loginUser,  };

