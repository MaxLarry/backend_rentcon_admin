const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
    getTopMostVisitedApprovedProperties,
    getAllUserCount, 
    userRegCount,
    userActiveCount, 
    getAllPropertyCount, 
    getStatusCounts, 
    getRequestCounts,
    getPropertyCount, 
    averagePriceByPropertyType} = require("../controllers/DataOverviewController");

const router = express.Router();

//User-Stats
router.get("/user-count", getAllUserCount);
router.get("/user-register-count", userRegCount);
router.get("/user-active-count", userActiveCount);


//Properties
router.get("/property-count", getAllPropertyCount);
router.get("/property-listing-status", getStatusCounts);
router.get("/request-listing-status", getRequestCounts);
router.get("/property-count-barangay", getPropertyCount);
router.get("/property-average-price", averagePriceByPropertyType);
router.get("/property-most-viewed", getTopMostVisitedApprovedProperties);

module.exports = router;
