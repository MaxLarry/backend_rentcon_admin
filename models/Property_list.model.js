// models/Property_list.js

const mongoose = require("mongoose");
const { Schema } = mongoose;
/*
const listingRequestSchema = new Schema({
  ownerName: { type: Schema.Types.ObjectId, ref: "User" },
  propertyType: String,
  address: String,
  numberOfRooms: Number,
  createdAt: { type: Date, default: Date.now },
  status: String,
});
*/
const PropertyListSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users"},
  description: { type: String, required: true },
  photo: { type: String, default: null },
  photo2: { type: String, default: null },
  photo3: { type: String, default: null },
  legalDocPhoto: { type: String, default: null },
  legalDocPhoto2: { type: String, default: null },
  legalDocPhoto3: { type: String, default: null },
  typeOfProperty: { type: String, required: true },
  street: { type: String, required: true },
  barangay: { type: String, required: true },
  city: { type: String, default: "Puerto Princesa City"},
  amenities: { type: [String], default: [] },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true, index: "2dsphere" },
  },
  status: {
    type: String,
    enum: ["Waiting", "Approved", "Declined", "Under Review"],
    default: "Waiting",
  },
  approved_date: { type: Date},
  rejected_date: { type: Date},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  visited:{ type: String },
  reasonDecline: { type: [String] },
  additionalComments: { type: String},
});

//const ListingRequest = mongoose.model("ListingRequest", listingRequestSchema);
const PropertyList = mongoose.model("PropertyList", PropertyListSchema, "listing_properties");


const roomSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  roomNumber: {
    type: Number,
    required: true
  },
  photo1: {
    type: String,
    default: null
  },
  photo2: {
    type: String,
    default: null
  },
  photo3: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  deposit: {
    type: Number,
    required: true
  },
  advance: {
    type: Number,
    required: true
  },
  roomStatus: {
    type: String,
    enum: ['available', 'unavailable', 'reserved'],
    default: 'available'
  },
  reservationDuration: {
    type: Number,
    required: true
  },
  reservationFee: {
    type: Number,
    required: true
  },
  occupantUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],
  occupantNonUsers: [{
    type: mongoose.Schema.Types.Mixed // Placeholder for non-user occupant data
  }],
  dueDate: {
    type: Date,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const Room = mongoose.model('Room', roomSchema, 'rooms');

module.exports = { Room,  PropertyList };
