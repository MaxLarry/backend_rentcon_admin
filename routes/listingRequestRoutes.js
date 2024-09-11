const express = require('express');
const ListingRequestController = require('../controllers/listingRequestController');
const router = express.Router();

router.get('/listing-requests', ListingRequestController.getAllRequests);

module.exports = router;
