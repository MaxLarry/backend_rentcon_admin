// services/ListingRequest.services.js
const mongoose = require("mongoose");
const { PropertyList } = require("../models/Property_list.model");

// Service function to fetch all pending requests and their profile data using aggregation
const getAllPendingRequestsWithProfiles = async () => {
  try {
    const result = await PropertyList.aggregate([
      {
        $match: {
          status: { $in: ["Waiting", "Under Review"] }, // Using $in to match multiple status values
        },
      },
      {
        $lookup: {
          from: "pending_request_profile",
          localField: "userId",
          foreignField: "userId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "propertyId",
          as: "rooms",
        },
      },
      {
        $unwind: {
          path: "$rooms",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          description: 1,
          status: 1,
          created_at: 1,
          typeOfProperty: 1,
          location: 1,
          address: {
            $concat: ["$street", ", ", "$barangay", ", ", "$city"],
          },
          amenities: {
            $cond: {
              if: { $isArray: "$amenities" },
              then: "$amenities",
              else: [],
            },
          },
          property_photo: {
            $filter: {
              input: ["$photo", "$photo2", "$photo3"],
              as: "photo",
              cond: { $ne: ["$$photo", null] },
            },
          },
          legal_docs: {
            $filter: {
              input: ["$legalDocPhoto", "$legalDocPhoto2", "$legalDocPhoto3"],
              as: "legaldocsPhoto",
              cond: { $ne: ["$$legaldocsPhoto", null] },
            },
          },
          profile: {
            email: "$user.email",
            fullName: {
              $concat: ["$profile.firstName", " ", "$profile.lastName"],
            },
            contactDetails: "$profile.contactDetails",
          },
          rooms: {
            roomId: "$rooms._id",
            roomNumber: "$rooms.roomNumber",
            roomPhoto: {
              $filter: {
                input: ["$rooms.photo1", "$rooms.photo2", "$rooms.photo3"],
                as: "roomPhoto",
                cond: { $ne: ["$$roomPhoto", null] },
              },
            },
            capacity: "$rooms.capacity",
            price: "$rooms.price",
            deposit: "$rooms.deposit",
            advance: "$rooms.advance",
            availability: "$rooms.availability",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          description: { $first: "$description" },
          amenities: { $first: "$amenities" },
          status: { $first: "$status" },
          location: { $first: "$location" },
          created_at: { $first: "$created_at" },
          typeOfProperty: { $first: "$typeOfProperty" },
          property_photo: { $first: "$property_photo" },
          legal_docs: { $first: "$legal_docs" },
          address: { $first: "$address" },
          profile: { $first: "$profile" },
          rooms: {
            $push: {
              roomId: "$rooms.roomId",
              roomNumber: "$rooms.roomNumber",
              roomPhoto: "$rooms.roomPhoto",
              capacity: "$rooms.capacity",
              price: "$rooms.price",
              deposit: "$rooms.deposit",
              advance: "$rooms.advance",
              availability: "$rooms.availability",
            },
          },
        },
      },
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};

// Service function to fetch all Approved requests and their profile data using aggregation
const getAllApprovedListing = async () => {
  try {
    const result = await PropertyList.aggregate([
      {
        $match: {
          status: "Approved",
        },
      },
      {
        $lookup: {
          from: "pending_request_profile",
          localField: "userId",
          foreignField: "userId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "propertyId",
          as: "rooms",
        },
      },
      {
        $unwind: {
          path: "$rooms",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          description: 1,
          status: 1,
          created_at: 1,
          approved_date: 1,
          typeOfProperty: 1,
          location: 1,
          address: {
            $concat: ["$street", ", ", "$barangay", ", ", "$city"],
          },
          amenities: {
            $cond: {
              if: { $isArray: "$amenities" },
              then: "$amenities",
              else: [],
            },
          },
          property_photo: {
            $filter: {
              input: ["$photo", "$photo2", "$photo3"],
              as: "photo",
              cond: { $ne: ["$$photo", null] },
            },
          },
          legal_docs: {
            $filter: {
              input: ["$legalDocPhoto", "$legalDocPhoto2", "$legalDocPhoto3"],
              as: "legaldocsPhoto",
              cond: { $ne: ["$$legaldocsPhoto", null] },
            },
          },
          profile: {
            email: "$user.email",
            fullName: {
              $concat: ["$profile.firstName", " ", "$profile.lastName"],
            },
            contactDetails: "$profile.contactDetails",
          },
          rooms: {
            roomId: "$rooms._id",
            roomNumber: "$rooms.roomNumber",
            roomPhoto: {
              $filter: {
                input: ["$rooms.photo1", "$rooms.photo2", "$rooms.photo3"],
                as: "roomPhoto",
                cond: { $ne: ["$$roomPhoto", null] },
              },
            },
            capacity: "$rooms.capacity",
            price: "$rooms.price",
            deposit: "$rooms.deposit",
            advance: "$rooms.advance",
            availability: "$rooms.availability",
            status: "$rooms.roomStatus",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          description: { $first: "$description" },
          amenities: { $first: "$amenities" },
          status: { $first: "$status" },
          location: { $first: "$location" },
          approved_date: { $first: "$approved_date" },
          typeOfProperty: { $first: "$typeOfProperty" },
          property_photo: { $first: "$property_photo" },
          legal_docs: { $first: "$legal_docs" },
          address: { $first: "$address" },
          profile: { $first: "$profile" },
          rooms: {
            $push: {
              roomId: "$rooms.roomId",
              roomNumber: "$rooms.roomNumber",
              roomPhoto: "$rooms.roomPhoto",
              capacity: "$rooms.capacity",
              price: "$rooms.price",
              deposit: "$rooms.deposit",
              advance: "$rooms.advance",
              availability: "$rooms.availability",
              status: "$rooms.status",
            },
          },
        },
      },
      {
        $addFields: {
          roomCount: {
            $cond: {
              if: { $or: [{ $eq: ["$rooms", null] }, { $eq: [{ $size: "$rooms" }, 0] }] },
              then: 0,
              else: { $size: {
                $filter: {
                  input: "$rooms",
                  as: "room",
                  cond: { $gt: [{ $size: "$$room.roomPhoto" }, 0] }
                }
              }}
            }
          }
        }
      }
      
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};


const getAllRejectedRequest = async () => {
  try {
    const result = await PropertyList.aggregate([
      {
        $match: {
          status: "Rejected", // Using $in to match multiple status values
        },
      },
      {
        $lookup: {
          from: "pending_request_profile",
          localField: "userId",
          foreignField: "userId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "propertyId",
          as: "rooms",
        },
      },
      {
        $unwind: {
          path: "$rooms",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          description: 1,
          status: 1,
          created_at: 1,
          rejected_date: 1,
          typeOfProperty: 1,
          location: 1,
          reasonDecline:1,
          additionalComments:1,
          address: {
            $concat: ["$street", ", ", "$barangay", ", ", "$city"],
          },
          amenities: {
            $cond: {
              if: { $isArray: "$amenities" },
              then: "$amenities",
              else: [],
            },
          },
          property_photo: {
            $filter: {
              input: ["$photo", "$photo2", "$photo3"],
              as: "photo",
              cond: { $ne: ["$$photo", null] },
            },
          },
          legal_docs: {
            $filter: {
              input: ["$legalDocPhoto", "$legalDocPhoto2", "$legalDocPhoto3"],
              as: "legaldocsPhoto",
              cond: { $ne: ["$$legaldocsPhoto", null] },
            },
          },
          profile: {
            email: "$user.email",
            fullName: {
              $concat: ["$profile.firstName", " ", "$profile.lastName"],
            },
            contactDetails: "$profile.contactDetails",
          },
          rooms: {
            roomId: "$rooms._id",
            roomNumber: "$rooms.roomNumber",
            roomPhoto: {
              $filter: {
                input: ["$rooms.photo1", "$rooms.photo2", "$rooms.photo3"],
                as: "roomPhoto",
                cond: { $ne: ["$$roomPhoto", null] },
              },
            },
            capacity: "$rooms.capacity",
            price: "$rooms.price",
            deposit: "$rooms.deposit",
            advance: "$rooms.advance",
            availability: "$rooms.availability",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          description: { $first: "$description" },
          amenities: { $first: "$amenities" },
          status: { $first: "$status" },
          location: { $first: "$location" },
          created_at: { $first: "$created_at" },
          rejected_date: { $first: "$rejected_date" },
          typeOfProperty: { $first: "$typeOfProperty" },
          property_photo: { $first: "$property_photo" },
          legal_docs: { $first: "$legal_docs" },
          address: { $first: "$address" },
          profile: { $first: "$profile" },
          reasonDecline: { $first: "$reasonDecline" },
          additionalComments: { $first: "$additionalComments" },
          rooms: {
            $push: {
              roomId: "$rooms.roomId",
              roomNumber: "$rooms.roomNumber",
              roomPhoto: "$rooms.roomPhoto",
              capacity: "$rooms.capacity",
              price: "$rooms.price",
              deposit: "$rooms.deposit",
              advance: "$rooms.advance",
              availability: "$rooms.availability",
            },
          },
        },
      },      
      {
        $addFields: {
          roomCount: {
            $cond: {
              if: { $or: [{ $eq: ["$rooms", null] }, { $eq: [{ $size: "$rooms" }, 0] }] },
              then: 0,
              else: { $size: {
                $filter: {
                  input: "$rooms",
                  as: "room",
                  cond: { $gt: [{ $size: "$$room.roomPhoto" }, 0] }
                }
              }}
            },
          },
        },
      },
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};


// Service function to update the status of a request
const updateRequestStatus = async (id, status) => {
  if (!status) {
    throw new Error("Status is required");
  }

  const request = await PropertyList.findByIdAndUpdate(
    id,
    { status },
    { new: true } // Return the updated document
  );

  if (!request) {
    throw new Error("Request not found");
  }

  return request;
};

module.exports = {
  getAllPendingRequestsWithProfiles,
  getAllApprovedListing,
  getAllRejectedRequest,
  updateRequestStatus,
};
