const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" }, // References the user
  fullName: { type: String, required: true },
  contactDetails: {
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  gender: { type: String, default: null },
  valid_id: { type: String, default: null }, // Path to uploaded valid ID file
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Profile = mongoose.model( "Profile" , ProfileSchema, "pending_request_profile"); // initial collection name
module.exports = Profile;
