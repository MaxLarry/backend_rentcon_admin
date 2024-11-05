const ActivityLog = require('../models/ActivityLogs.model');
const ActivityLogsService = require("../services/ActivityLogs.services")

async function getAllActivityLogs(req, res) {
  try {
    const adminId = req.query.adminId || null;

    // Pass the adminId to the service method
    const requests = await ActivityLogsService.getAllActivityLogs(adminId);

    if (!requests.length) {
      return res.json({ message: "No data available" });
    }

    res.json(requests);
  } catch (error) {
    console.error("Error fetching Activity logs requests:", error);
    res.status(500).json({ message: "Server error" });
  }
}


  const deleteActivityLogs = async (req, res) => {
    const { ids } = req.body; // Get the array of activity log IDs from the request body

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'No activity log IDs provided for deletion' });
    }

    try {
        const result = await ActivityLog.deleteMany({ _id: { $in: ids } });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No activity logs found for the given IDs' });
        }

        return res.status(200).json({ message: 'Activity logs successfully deleted' });
    } catch (error) {
        console.error("Error deleting Activity logs:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports ={
    getAllActivityLogs,
    deleteActivityLogs,
};