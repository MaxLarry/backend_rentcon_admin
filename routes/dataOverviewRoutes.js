const express = require("express");
const { 
    getAllUserCount, 
    userRegCount,
    userActiveCount, 
    getAllPropertyCount, 
    getStatusCounts, 
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
router.get("/property-count-barangay", getPropertyCount);
router.get("/property-average-price", averagePriceByPropertyType);


module.exports = router;
