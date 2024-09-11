const ListingRequest = require('../models/Property_list');

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ListingRequest.find()
      .populate('ownerName', 'name') // Populate ownerName field with the name field from User
      .exec();

    if (requests.length === 0) {
      return res.status(404).json({ message: 'No data available' });
    }

    res.json(requests);
  } catch (error) {
    console.error('Error fetching listing requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
