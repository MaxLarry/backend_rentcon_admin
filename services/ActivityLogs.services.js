const ActivityLog = require('../models/ActivityLogs.model'); 
const { Types } = require("mongoose");

const getAllActivityLogs = async (adminId) => {
  try {
    // If adminId is provided, convert it to an ObjectId, otherwise leave matchStage empty
    const matchStage = adminId ? { admin_id: new Types.ObjectId(adminId) } : {};

    const result = await ActivityLog.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "rentcon_admins",
          localField: "admin_id",
          foreignField: "_id",
          as: "admin"
        }
      },
      {
        $unwind: { path: "$admin", preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: "$_id",
          adminId: { $first: "$admin_id" },
          profilePicture: { $first: "$admin.profilePicture" },
          admin_name: { $first: { $concat: ["$admin.first_name", " ", "$admin.last_name"] } },
          role: { $first: "$admin.role" },
          action: { $first: "$action" },
          ip_address: { $first: "$ip_address" },
          entity_affected: { $first: "$entity_affected" },
          changes: { $first: "$changes" },
          timestamp: { $first: "$createdAt" }
        }
      }
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};




  const getAllActivityLogsForCurrentUser = async (adminId) => {
    try {
      const result = await ActivityLog.aggregate([
        {
          $match: { admin_id: adminId } // Filter logs for the current admin
        },
        {
          $lookup: {
            from: "rentcon_admins",
            localField: "admin_id",
            foreignField: "_id",
            as: "admin"
          }
        },
        {
          $unwind: { path: "$admin", preserveNullAndEmptyArrays: true }
        },
        {
          $group: {
            _id: "$_id",
            adminId: { $first: "$admin_id" },
            profilePicture: { $first: "$admin.profilePicture" },
            admin_name: { $first: { $concat: ["$admin.first_name", " ", "$admin.last_name"] } },
            role: { $first: "$admin.role" },
            action: { $first: "$action" },
            ip_address: { $first: "$ip_address" },
            entity_affected: { $first: "$entity_affected" },
            changes: { $first: "$changes" },
            timestamp: { $first: "$createdAt" }
          }
        }
      ]);
  
      return result;
    } catch (error) {
      throw error;
    }
};

module.exports = {
    getAllActivityLogs,
    getAllActivityLogsForCurrentUser
};