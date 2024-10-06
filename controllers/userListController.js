const userListService = require("../services/UserList.service");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const { PropertyList, Room } = require("../models/Property_list.model");
const { UserProfile, UserAccount } = require("../models/User.model");

/*
async function getAlluserProfileRequest(req, res) {
  try {
    const requests = await UserProfileRequestService.getAllUserRequests();

    if (!requests.length) {
      return res.status(404).json({ message: "No data available" });
    }

    res.json(requests);
  } catch (error) {
    console.error("Error fetching user profile requests:", error);
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = {
  getAlluserProfileRequest,
};*/

//fetch all unverified
async function fetchAllUnverified(req, res) {
  try {
    const unverified = await userListService.getAllUnverified();

    if (unverified.length === 0) {
      return res.json({ message: "No data available" });
    }

    //res.json(unverified);
    res.json({
      //message: "unverified fetched successfully",
      count: unverified.length,
      unverified: unverified,
    });
  } catch (error) {
    console.error("Error fetching list of unverified:", error);
    res.status(500).json({ message: "Server error" });
  }
}


// Fetch all landlords users
async function fetchAllLandlords(req, res) {
  try {
    const landlords = await userListService.getAllLandlords();

    if (landlords.length === 0) {
      return res.json({ message: "No data available" });
    }

   // res.json(landlords);
    res.json({
      //message: "Landlords fetched successfully",
      count: landlords.length,
      landlords: landlords,
    });
  } catch (error) {
    console.error("Error fetching list of Landlords:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function fetchAllOccupants(req, res) {
  try {
    const occupants = await userListService.getAllOccupants();

    if (occupants.length === 0) {
      return res.json({ message: "No data available" });
    }

    //res.json(occupants);
    res.json({
      //message: "Occupants fetched successfully",
      count: occupants.length,
      occupants: occupants,
    });
  } catch (error) {
    console.error("Error fetching list of occupants:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function fetchAllUserRequest(req, res) {
  try {
    const UserRequest = await userListService.getAllUserRequests();

    if (UserRequest.length === 0) {
      return res.json({ message: "No data available", count: 0 });
    }

    //res.json(UserRequest);
    res.json({
      //message: "Occupants fetched successfully",
      count: UserRequest.length,
      UserRequestVerification: UserRequest,
    });
  } catch (error) {
    console.error("Error fetching list of User Request:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Fetch all admin users
const fetchAdmins = async (req, res) => {
  try {
    const admins = await userListService.getAllAdmins();

    if (admins.length === 0) {
      return res.json({ message: "No admins found", count: 0 });
    }

    // Map through the admins and concatenate first_name and last_name
    const adminsWithFullName = admins.map((admin) => {
      const { password_hash, ...adminData } = admin._doc; // Exclude password_hash
      return {
        ...adminData, // Keep other properties of the admin object
        fullName: `${admin.first_name} ${admin.last_name}`, // Concatenate first_name and last_name
      };
    });

    // Include the count of all admins in the response
    res.status(200).json({ count: admins.length, admins: adminsWithFullName });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

const addAdminUser = async (req, res) => {
  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new admin user
    const newAdmin = new Admin({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password_hash: hashedPassword,
      phone_num: req.body.phone,
      role: req.body.role,
    });
    await newAdmin.save();

    return res.status(201).json({ message: "Admin added successfully." });
  } catch (error) {
    console.error("Error adding admin user:", error); //debugging libagin
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating user with ID:", id); // Log the ID debuggingg
    console.log("Request body:", req.body); // Log the body content debuggingg

    const { firstName, lastName, gender, phone, address } = req.body;

    const updatedUser = await UserProfile.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        gender,
        'contactDetails.phone': phone,
        'contactDetails.address': address,
        updated_at: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Update error:", error); // Log any errors
    return res.status(500).json({ message: "Server error" });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating admin with ID:", id); // Log the ID debuggingg
    console.log("Request body:", req.body); // Log the body content debuggingg

    const { firstName, lastName, role, phone,  } = req.body;

    const updateAdmin = await Admin.findByIdAndUpdate(
      id,
      {
        'first_name': firstName,
        'last_name': lastName,
        role,
        'phone_num': phone,
        updated_at: new Date(),
      },
      { new: true }
    );

    if (!updateAdmin) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Admin updated successfully", updateAdmin });
  } catch (error) {
    console.error("Update error:", error); // Log any errors
    return res.status(500).json({ message: "Server error" });
  }
};

//deletion of Properties With Rooms
const deleteUserLandlordWithPropertiesAndRooms = async (req, res) => {
  const { userId } = req.body; // Get the landlord user ID from the request body

  if (!userId) {
    return res
      .status(400)
      .json({ message: "No user ID provided for deletion" });
  }

  try {
    // Find all properties associated with the landlord user
    const properties = await PropertyList.find({ userId: userId });
    // Get an array of property IDs to delete associated rooms
    const propertyIds = properties.map((property) => property._id);
    // Delete the rooms associated with the properties
    await Room.deleteMany({ propertyId: { $in: propertyIds } });
    await PropertyList.deleteMany({_id: { $in: propertyIds },});
    await UserAccount.deleteOne({ _id: userId });
    await UserProfile.deleteOne({ userId: userId });


    return res
      .status(200)
      .json({
        message:
          "Landlord user, properties, rooms, and profile deleted successfully",
      });
  } catch (error) {
    console.error(
      "Error deleting landlord user, properties, rooms, and profile:",
      error
    );
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//deletion of Properties With Rooms
const deleteUserSelectedLandlordsandCredentials = async (req, res) => {
  const { ids } = req.body; // Get the landlord user ID from the request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No user IDs provided for deletion" });
  }

  try {
    // Find all properties associated with the landlord user
    const properties = await PropertyList.find({ userId: { $in: ids } });

    // Get an array of property IDs to delete associated rooms
    const propertyIds = properties.map((property) => property._id);

    // Delete the rooms associated with the properties
    await Room.deleteMany({ propertyId: { $in: propertyIds } });

    // Delete the properties
    await PropertyList.deleteMany({ _id: { $in: propertyIds } });

    // Delete the landlord users
    await UserAccount.deleteMany({ _id: { $in: ids } });

    // Delete the landlords' profiles from the profile collection
    await UserProfile.deleteMany({ userId: { $in: ids } });

    return res.status(200).json({
      message: "Landlord users, properties, rooms, and profiles deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting landlord users, properties, rooms, and profiles:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


//deletion of Properties With Rooms
const deleteUserOccupant = async (req, res) => {
  const { userId } = req.body; // Get the landlord user ID from the request body

  if (!userId) {
    return res
      .status(400)
      .json({ message: "No user ID provided for deletion" });
  }

  try {
    await UserAccount.deleteOne({ _id: userId });
    await UserProfile.deleteOne({ userId: userId });
    return res
      .status(200)
      .json({
        message:
          "Occupant user Deleted Sucessfully",
      });
  } catch (error) {
    console.error(
      "Error deleting occupant user",
      error
    );
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//deletion of Properties With Rooms
const deleteUserSelectedOccupants = async (req, res) => {
  const { ids } = req.body; // Get the user ID from the request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No user IDs provided for deletion" });
  }

  try {

    await UserAccount.deleteMany({ _id: { $in: ids } });
    await UserProfile.deleteMany({ userId: { $in: ids } });

    return res.status(200).json({
      message: "Selected Occupants user and profiles deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting occupant users, properties, rooms, and profiles:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


//deletion of Properties With Rooms
const deleteUser = async (req, res) => {
  const { userId } = req.body; // Get the user ID from the request body

  if (!userId) {
    return res
      .status(400)
      .json({ message: "No user ID provided for deletion" });
  }

  try {
    await UserAccount.deleteOne({ _id: userId });
    await UserProfile.deleteOne({ userId: userId });
    return res
      .status(200)
      .json({
        message:
          "User Deleted Sucessfully",
      });
  } catch (error) {
    console.error(
      "Error deleting user",
      error
    );
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//deletion of Properties With Rooms
const deleteUserSelected = async (req, res) => {
  const { ids } = req.body; // Get the user ID from the request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No user IDs provided for deletion" });
  }

  try {

    await UserAccount.deleteMany({ _id: { $in: ids } });
    await UserProfile.deleteMany({ userId: { $in: ids } });

    return res.status(200).json({
      message: "Selected Unverified user deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const deleteAdmin = async (req, res) => {
  const { userId } = req.body; 

  if (!userId) {
    return res
      .status(400)
      .json({ message: "No user ID provided for deletion" });
  }

  try {
    await Admin.deleteOne({ _id: userId });
    //await UserProfile.deleteOne({ userId: userId });
    return res
      .status(200)
      .json({
        message:
          "Admin Deleted Sucessfully",
      });
  } catch (error) {
    console.error(
      "Error deleting occupant user",
      error
    );
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const deleteSelectedAdmin = async (req, res) => {
  const { ids } = req.body; // Get the landlord user ID from the request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No user IDs provided for deletion" });
  }

  try {

    await Admin.deleteMany({ _id: { $in: ids } });
   // await UserProfile.deleteMany({ userId: { $in: ids } });

    return res.status(200).json({
      message: "Selected Admins deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const updateRequestProfileStatus = async (req, res) => {
  const { id } = req.params; // userId passed as parameter
  const { profileStatus, isProfileComplete } = req.body; // Extract from body

  try {
    // Call the service function to handle both profileStatus and isProfileComplete
    const updatedRequest = await userListService.updateRequestProfileStatus(id, profileStatus, isProfileComplete);
    
    // Respond with the updated profile
    res.json(updatedRequest);
  } catch (error) {
    console.error(`Error updating status for request with ID: ${id}`, error);

    // Handle specific error messages
    if (error.message === "Profile status is required") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "UserProfile not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }

    // Handle other server errors
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  fetchAdmins,
  addAdminUser,
  fetchAllLandlords,
  fetchAllOccupants,
  fetchAllUserRequest,
  updateUser,
  updateAdmin,
  deleteUserLandlordWithPropertiesAndRooms,
  deleteUserSelectedLandlordsandCredentials,
  deleteUserOccupant,
  deleteUserSelectedOccupants,
  deleteSelectedAdmin,
  deleteAdmin,
  fetchAllUnverified,
  deleteUser,
  deleteUserSelected,
  updateRequestProfileStatus,
};
