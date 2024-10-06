const express = require("express");
const {  loginUser} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();


router.post("/login", loginUser);

router.get("/checkAuth", protect, (req, res) => {
  res.status(200).json({message: "Login Sucessfully", isAuthenticated: true, user: {
    _id: req.user._id,
    name: req.user.first_name + " "+ req.user.last_name,//concat the firstname and lastname
    email: req.user.email,
    role: req.user.role,
    phone_num: req.user.phone_num,
    last_login: req.user.last_login,
    status: req.user.status,
    profilePicture: req.user.profilePicture,
  },} );
});


router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: req.secure || process.env.NODE_ENV === "production", 
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});


module.exports = router;
