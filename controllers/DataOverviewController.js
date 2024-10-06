const DataOverviewService = require("../services/DataOverview.services")

async function getAllUserCount(req, res) {
    try {
      const requests = await DataOverviewService.getAllUserCount();
  
      if (!requests.length) {
        return res.json({ message: "No data available" });
      }
  
      res.json(requests);
    } catch (error) {
      console.error("Error fetching User Count:", error);
      res.status(500).json({ message: "Server error" });
    }
  }


    async function userRegCount(req, res) {
        const { timeframe } = req.query; 

        try {
            const counts = await DataOverviewService.userRegCountService.getUserCount(timeframe);
            res.json(counts); 
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message }); // Send back a 400 error for invalid timeframe
        }
    }

    async function userActiveCount(req, res) {
      const { timeframe } = req.query; 

      try {
          const counts = await DataOverviewService.getActiveUserCount(timeframe);
          res.json(counts); 
      } catch (error) {
          console.error(error);
          res.status(400).json({ error: error.message }); // Send back a 400 error for invalid timeframe
      }
  }

  async function getStatusCounts(req, res) {
    const { timeframe } = req.query; 

    try {
        const counts = await DataOverviewService.getStatusCounts(timeframe);
        res.json(counts); 
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message }); // Send back a 400 error for invalid timeframe
    }
}


  async function getAllPropertyCount(req, res) {
    try {
      const requests = await DataOverviewService.getAllPropertyCount();
  
      if (!requests.length) {
        return res.json({ message: "No data available" });
      }
  
      res.status(200).json(requests);
    } catch (error) {
      console.error("Error fetching Property Count:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async function getPropertyCount(req, res) {
    try {
      const requests = await DataOverviewService.getPropertyCountByBarangay();
  
      if (!requests.length) {
        return res.json({ message: "No data available" });
      }
  
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  async function averagePriceByPropertyType(req, res) {
    try {
      const requests = await DataOverviewService.getAveragePriceByPropertyType();
  
      if (!requests.length) {
        return res.json({ message: "No data available" });
      }
  
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }


module.exports ={
    getAllUserCount,
    userRegCount,
    userActiveCount,
    getAllPropertyCount,
    getStatusCounts,
    getPropertyCount,
    averagePriceByPropertyType,
};