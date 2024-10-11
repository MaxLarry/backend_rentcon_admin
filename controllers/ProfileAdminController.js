const Admin = require("../models/Admin");
const path = require('path');
const upload = require('../multer.config');

// Remove profile picture
const removeProfilePicture = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Admin.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Remove profile picture by setting it to an empty string
    user.profilePicture = "";
    await user.save();

    res.status(200).json({
      message: "Profile picture removed successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing profile picture",
      error: error.message,
    });
  }
};




// Controller function for uploading profile picture
const uploadProfilePicture = (req, res) => {
  upload.single('profilePicture')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ message: "Error uploading file", error: err.message });
    }

    if (!req.file) {
      console.error('No file received');
      return res.status(400).json({ message: "No file received. Please upload a valid image." });
    }

    console.log('File details:', req.file);
    const { adminId } = req.body;

    // Check if adminId is defined
    if (!adminId) {
      return res.status(400).json({ message: "adminId is required" });
    }

    try {
      const profilepicPath = req.file.path; // Cloudinary URL
      const profile = await Admin.findOneAndUpdate(
        { _id: adminId },
        { profilePicture: profilepicPath, updated_at: Date.now() },
        { new: true }
      );

      console.log('Profile updated:', profile);
      res.status(200).json({ message: "Successfully changed profile picture", profile });
    } catch (error) {
      console.error('Error in updating profile:', error);
      res.status(500).json({ message: "Error changing profile picture", error: error.message });
    }
  });
};


module.exports = {
  removeProfilePicture, uploadProfilePicture,
};


