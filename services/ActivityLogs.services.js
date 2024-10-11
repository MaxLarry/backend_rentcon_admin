const ActivityLog = require('../models/ActivityLogs.model'); 

const getAllActivityLogs = async () => {
    try {
      const result = await ActivityLog.aggregate([
        {
          $lookup: {
            from: "rentcon_admins", // Join with profiles
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
            _id: "$_id", // Group by the occupant's user ID
            adminId:{ $first: "$admin_id" },
            profilePicture: { $first: "$admin.profilePicture" },
            admin_name: { $first: { $concat: ["$admin.first_name", " ", "$admin.last_name"] } },
            role:{$first:"$admin.role" },
            action: { $first: "$action" }, 
            ip_address: { $first: "$ip_address" },
            entity_affected: { $first: "$entity_affected" },
            changes: { $first: "$changes"},
            timestamp: { $first: "$createdAt"}
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