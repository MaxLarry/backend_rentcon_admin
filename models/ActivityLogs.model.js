const mongoose = require("mongoose");

// Define the schema with automatic timestamps
const activityLogSchema = new mongoose.Schema(
  {
    admin_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Admin' }, // Reference to the Admin model
    role: { type: String, required: true },
    action: { type: String, required: true }, // Actions may not be unique
    ip_address: { type: String, required: true },
    entity_affected: { type: String, default: "active" },
    changes: { type: String, required: false },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt fields
);

// Create the model
const ActivityLog = mongoose.model("ActivityLog", activityLogSchema, "admin_activitylogs");

module.exports = ActivityLog;
