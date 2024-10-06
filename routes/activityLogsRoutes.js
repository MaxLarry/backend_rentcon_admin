const express = require("express");
const { getAllActivityLogs, deleteActivityLogs } = require("../controllers/ActivityLogsController");
const router = express.Router();


router.get("/admin-activity-logs", getAllActivityLogs);
router.delete("/admin-logs-deletion", deleteActivityLogs);

module.exports = router;
