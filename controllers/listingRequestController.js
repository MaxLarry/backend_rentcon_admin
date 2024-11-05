// controllers/listingRequestController.js
const PropertyListService = require("../services/ListingRequest.services");
const { PropertyList, Room } = require("../models/Property_list.model");
const { logActivity } = require("../middleware/authMiddleware");
const {sendListingRequestResponse} = require('../services/Emailer.service')
const {UserAccount} = require('../models/User.model')

// Get all Approved Listing Properties
async function getAllApprovedListing(req, res) {
  try {
    const requests = await PropertyListService.getAllApprovedListing();

    if (!requests.length) {
      return res.json({ message: "No data available" });
    }

    res.json(requests);
  } catch (error) {
    console.error("Error fetching Approved Properties:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Controller to get a pending request by ID
// Get all listing requests with profiles
async function getAllPendingRequests(req, res) {
  try {
    const requests =
      await PropertyListService.getAllPendingRequestsWithProfiles();

    if (!requests.length) {
      return res.json({ message: "No data available" });
    }

    res.json(requests);
  } catch (error) {
    console.error("Error fetching listing requests:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getAllRejectedRequest(req, res) {
  try {
    const requests = await PropertyListService.getAllRejectedRequest();

    if (!requests.length) {
      return res.json({ message: "No data available" });
    }

    res.json(requests);
  } catch (error) {
    console.error("Error fetching Rejected requests:", error);
    res.status(500).json({ message: "Server error" });
  }
}

const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, selectedIssues, additionalComments } = req.body;

  // Validate status
  if (!status || typeof status !== "string") {
    return res.status(400).json({ message: "Valid status is required" });
  }

  let action;
  let updateFields = {}; // To hold the fields that will be updated
  let emailSubject;
  let emailBody;

  switch (status) {
    case "Approved":
      action = "Approved listing";
      updateFields = { status, approved_date: new Date(), visited: 0 }; // Set approved_date to current date
      emailSubject = "Your Listing Has Been Approved!";
      emailBody = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>Congratulations!</h2>
          <p>Your listing request has been approved.</p>
          <p>Thank you for using RentConnect.</p>
        </div>
      `;
      break;
    case "Rejected":
      // Validate selectedIssues and additionalComments
      if (!selectedIssues || !Array.isArray(selectedIssues)) {
        return res
          .status(400)
          .json({
            message: "Selected issues are required and should be an array",
          });
      }
      action = "Rejected listing";
      updateFields = {
        status,
        rejected_date: new Date(), // Set rejected_date to current date
        reasonDecline: selectedIssues, // Store selected issues
        additionalComments: additionalComments, // Store additional comments
      };
      emailSubject = "Your Listing Has Been Rejected";
      emailBody = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>We're Sorry</h2>
          <p>Your listing request has been rejected for the following reasons:</p>
          <ul>
            ${selectedIssues.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
          <p>Additional Comments: ${additionalComments || "None"}</p>
        </div>
      `;
      break;
    case "Waiting":
      action = "Cancel Review";
      updateFields = { status }; // No date for Waiting
      break;
    case "Under Review":
      action = "Review Property";
      updateFields = { status }; // No date for Under Review
      break;
    default:
      return res.status(400).json({ message: "Invalid status provided" });
  }

  try {
    // Fetch the current request to get its current status
    const currentRequest = await PropertyList.findById(id);

    if (!currentRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    const oldStatus = currentRequest.status; // Get the current status of the request
    const userAccount = await UserAccount.findById(currentRequest.userId);
    if (!userAccount || !userAccount.email) {
      return res.status(404).json({ message: "User or user email not found" });
    }
  
    const userEmail = userAccount.email;
    
    // Update the request status and add date fields only if they don't exist
    const updatedRequest = await PropertyList.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    // Log the activity (non-blocking)
    const changes = `Status changed from ${oldStatus} to ${status}`;
    logActivity(
      req.user,
      action,
      req.ip,
      `Listing request with ID: ${id}`,
      changes
    ).catch((err) => {
      console.error("Failed to log activity:", err);
    });

    // Send an email if the status is "Approved" or "Rejected"
    if (status === "Approved" || status === "Rejected") {
      sendListingRequestResponse(
        userEmail,
        (error, response) => {
          if (error) {
            console.error("Failed to send email:", error);
          } else {
            console.log("Email sent:", response);
          }
        },
        emailSubject,
        emailBody
      );
    }
  console.log(userEmail);
    return res.json({
      message: "Request status updated successfully",
      updatedRequest, // Return the updated request
    });
  } catch (error) {
    console.error(`Error updating status for request with ID: ${id}`, error);

    return res.status(500).json({ message: "Server error" });
  }
};

//deletion of Properties With Rooms
const deletePropertiesWithRooms = async (req, res) => {
  const { ids } = req.body; // Get the array of property IDs from the request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "No property IDs provided for deletion" });
  }

  try {
    // Delete the rooms associated with the properties
    await Room.deleteMany({ propertyId: { $in: ids } });

    // Delete the properties
    const result = await PropertyList.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No properties found for the given IDs" });
    }

    // Log the activity (non-blocking)
    const propertiesDeleted = ids.length;
    const changes = `${propertiesDeleted} properties and their associated rooms deleted.`;
    //console.log("ito ang user:", req.user); //debugg
    logActivity(
      req.user,
      "Delete Properties",
      req.ip,
      `Properties with IDs: ${ids.join(", ")}`,
      changes
    ).catch((err) => {
      console.error("Failed to log activity:", err);
    });

    return res
      .status(200)
      .json({
        message: "Properties and associated rooms deleted successfully",
      });
  } catch (error) {
    console.error("Error deleting properties and rooms:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  getAllPendingRequests,
  getAllApprovedListing,
  getAllRejectedRequest,
  updateRequestStatus,
  deletePropertiesWithRooms,
};
