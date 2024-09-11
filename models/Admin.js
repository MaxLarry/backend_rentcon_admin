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
  status: { type: String, default: "active" }
}, { timestamps: true }); // Automatically add created_at and updated_at fields


const Admin = mongoose.model("rentcon_admins", AdminSchema);
module.exports = Admin;
