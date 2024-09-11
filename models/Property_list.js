const mongoose = require("mongoose");
const { Schema }= require("mongoose");


const listingRequestSchema = new mongoose.Schema({
    ownerName: { type: Schema.Types.ObjectId, ref: 'User' },
    propertyType: String,
    address: String,
    numberOfRooms: Number,
    createdAt: Date,
    status: String
  });
  
  const ListingRequest = mongoose.model('properties', listingRequestSchema);
  module.exports = ListingRequest;