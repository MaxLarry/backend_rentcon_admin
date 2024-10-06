// userService.js
const Admin = require('../models/Admin'); // Import your User model
const {UserAccount, UserProfile}  = require('../models/User.model');
const Profile = require('../models/Profile')

// Fetch all admin users
const getAllAdmins = async () => {
  try {
    const adminRoles = ["Super-Admin", "Admin", "Listing Manager", "User Manager"];
    const admins = await Admin.find({ role: { $in: adminRoles } }); // Find users with roles in the adminRoles array
    return admins;
  } catch (error) {
    throw new Error('Error fetching admins: ' + error.message);
  }
};

const getAllUnverified = async () => {
  try {
    const result = await UserAccount.aggregate([
      {
        $match: { isProfileComplete: false } // Filter for Unverified
      },
      {
        $lookup: {
          from: "pending_request_profile", // Join with profiles
          localField: "_id",
          foreignField: "userId",
          as: "profile"
        }
      },
      {
        $unwind: { path: "$profile", preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: "$_id", 
          email: { $first: "$email" },
          created_at: { $first: "$created_at" },
          last_login:  { $first: "$last_login" }
        }
      },
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};

const getAllLandlords = async () => {
  try {
    const result = await UserAccount.aggregate([
      {
        $match: { role: "landlord", isProfileComplete: true } // Filter for landlords
      },
      {
        $lookup: {
          from: "pending_request_profile", // Join with profiles
          localField: "_id",
          foreignField: "userId",
          as: "profile"
        }
      },
      {
        $unwind: { path: "$profile", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "listing_properties", // Join with properties
          localField: "_id",
          foreignField: "userId",
          as: "properties"
        }
      },
      {
        $unwind: { path: "$properties", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "rooms", // Join with rooms
          localField: "properties._id",
          foreignField: "propertyId",
          as: "rooms"
        }
      },
      {
        $group: {
          _id: "$_id", // Group by the user id (which ensures each user appears only once)
          profile_id:{$first: "$profile._id"},
          email: { $first: "$email" },
          role: { $first: "$role" },
          profilePicture: { $first: "$profilePicture" },
          firstName:{$first: "$profile.firstName"},
          lastName:{$first: "$profile.lastName"},
          fullName: { $first: { $concat: ["$profile.firstName", " ", "$profile.lastName"] } },
          gender: { $first: "$profile.gender" },
          contactDetails: { $first: "$profile.contactDetails" },
          Status: { $first: "$profile.profileStatus" },
          valid_id: { $first: "$profile.valid_id" },
          properties: { $push: { property_id: "$properties._id", property_photo: { $filter: { input: ["$properties.photo", "$properties.photo2", "$properties.photo3"], as: "photo", cond: { $ne: ["$$photo", null] } } }, roomCount: { $size: "$rooms" } } },
          created_at: { $first: "$created_at" },
          last_login:  { $first: "$last_login" }
        }
      },
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};

const getAllOccupants = async () => {
  try {
    const result = await UserAccount.aggregate([
      {
        $match: { role: "occupant", isProfileComplete: true } // Filter for occupants
      },
      {
        $lookup: {
          from: "pending_request_profile", // Join with profiles
          localField: "_id",
          foreignField: "userId",
          as: "profile"
        }
      },
      {
        $unwind: { path: "$profile", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "rooms", // Join with rooms collection
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$$userId", "$occupantUsers"] } // Match occupant in occupantUsers only
              }
            }
          ],
          as: "rentedRooms" // Name of the new array field for rented rooms
        }
      },
      {
        $unwind: { path: "$rentedRooms", preserveNullAndEmptyArrays: true } // Unwind rented rooms
      },
      {
        $lookup: {
          from: "listing_properties", // Join with properties collection
          localField: "rentedRooms.propertyId", // Field from rooms collection
          foreignField: "_id", // Match with property _id
          as: "propertyInfo"
        }
      },
      {
        $unwind: { path: "$propertyInfo", preserveNullAndEmptyArrays: true } // Unwind property info
      },
      {
        $lookup: {
          from: "pending_request_profile", // Join with profiles to get landlord info
          localField: "propertyInfo.userId", // Assume landlordId is stored in propertyInfo
          foreignField: "userId", // Match with the landlord's userId in profiles
          as: "landlordProfile"
        }
      },
      {
        $unwind: { path: "$landlordProfile", preserveNullAndEmptyArrays: true } // Unwind landlord profile info
      },
      {
        $group: {
          _id: "$_id", // Group by the occupant's user ID
          profile_id: { $first: "$profile._id" },
          email: { $first: "$email" },
          role: { $first: "$role" },
          profilePicture: { $first: "$profilePicture" },
          fullName: { $first: { $concat: ["$profile.firstName", " ", "$profile.lastName"] } },
          firstName: { $first: "$profile.firstName" },
          lastName: { $first: "$profile.lastName" },
          gender: { $first: "$profile.gender" },
          contactDetails: { $first: "$profile.contactDetails" },
          Status: { $first: "$profile.profileStatus" },
          valid_id: { $first: "$profile.valid_id" },
          currentProperty: {
            $push: {
              roomId: "$rentedRooms._id",
              propertyId: "$rentedRooms.propertyId",
              propertyAddress: {
                $concat: ["$propertyInfo.street", ", ", "$propertyInfo.barangay", ", ", "$propertyInfo.city"]
              },
              landlordName: {
                $concat: ["$landlordProfile.firstName", " ", "$landlordProfile.lastName"]
              }, // Add landlord's name here
              price: "$rentedRooms.price",
              capacity: "$rentedRooms.capacity",
              roomStatus: "$rentedRooms.roomStatus",
              dueDate: "$rentedRooms.dueDate",
              rentedDate: "$rentedRooms.rentedDate"
            }
          },
          created_at: { $first: "$created_at" },
          last_login: { $first: "$last_login" }
        }
      }
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};


const getAllUserRequests = async () => {
  try {
    const result = await Profile.aggregate([
      {
        $match: { profileStatus: "pending" } // Filter for occupants
      },
      {
        $lookup: {
          from: "users", // Join with profiles
          localField: "userId",
          foreignField: "_id",
          as: "users"
        }
      },
      {
        $unwind: { path: "$users", preserveNullAndEmptyArrays: true }
      },
      {
        $match: { "users.isProfileComplete": false } // Match if the profile is not complete
      },
      {
        $group: {
          _id: "$users._id", // Group by the occupant's user ID
          profileId:{ $first: "$_id" },
          email: { $first: "$users.email" },
          role: { $first: "$users.role" },
          profilePicture: { $first: "$profilePicture" },
          fullName: { $first: { $concat: ["$firstName", " ", "$lastName"] } },
          gender: { $first: "$gender" },
          contactDetails: { $first: "$contactDetails" },
          dateRequest: {$first: "$users.created_at"},
          registeredDate: {$first: "$users.created_at"},
          Status: { $first: "$profileStatus" },
          valid_id: { $first: "$valid_id" },
          isProfileComplete: { $first: "$users.isProfileComplete" } 
        }
      }
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};


const updateRequestProfileStatus = async (userId, profileStatus, isProfileComplete) => {
  if (!profileStatus) {
    throw new Error("Profile status is required");
  }

  // Update profileStatus in UserProfile collection
  const userProfile = await UserProfile.findOneAndUpdate(
    { userId }, // Find by userId in the UserProfile collection
    { profileStatus }, // Update the profileStatus
    { new: true } // Return the updated document
  );

  if (!userProfile) {
    throw new Error("UserProfile not found");
  }

  // If isProfileComplete is provided, update it in the UserAccount collection
  if (typeof isProfileComplete !== "undefined") {
    const user = await UserAccount.findByIdAndUpdate(
      userId, // Find by userId in the UserAccount collection
      { isProfileComplete }, // Update the isProfileComplete field
      { new: true } // Return the updated document
    );

    if (!user) {
      throw new Error("User not found");
    }
  }

  return userProfile; // Return the updated UserProfile document
};


module.exports = {
  getAllAdmins,
  getAllLandlords,
  getAllOccupants,
  getAllUserRequests,
  getAllUnverified,
  updateRequestProfileStatus
};
