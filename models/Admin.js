const mongoose = require("mongoose");
// Define the schema with the timestamps option
const AdminSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: true },
  phone_num: { type: String, required: true },
  last_login: { type: Date },
  status: { type: String, default: "active" },
  profilePicture: { type: String, required: false, default:"" }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

const Admin = mongoose.model("rentcon_admins", AdminSchema);
module.exports = Admin;
