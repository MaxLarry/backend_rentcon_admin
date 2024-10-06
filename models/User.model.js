const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
  contactDetails: {
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  created_at: { type: Date, default: Date.now },
  firstName: { type: String, required: true },
  gender: { type: String, required: true },
  lastName: { type: String, required: true },
  profileStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  updated_at: { type: Date, default: Date.now },
  valid_id: { type: String, required: true },
});

const UserProfile = mongoose.model(
  "UserProfile",
  userProfileSchema,
  "pending_request_profile"
);


const userAccountSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  bookmarks: [{
    type: Schema.Types.ObjectId,
    ref: 'bookmarks' 
  }],
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['occupant', 'landlord'],
    default: 'none'
  },
  profilePicture: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const UserAccount = mongoose.model('UserAccount', userAccountSchema, 'users');


module.exports = { UserProfile, UserAccount };
