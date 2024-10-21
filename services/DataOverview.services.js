const { UserAccount } = require("../models/User.model");
const { PropertyList, Room } = require("../models/Property_list.model");

const getAllUserCount = async () => {
  try {
    const result = await UserAccount.aggregate([
      {
        $facet: {
          LandlordCount: [
            { $match: { role: "landlord", isProfileComplete: true } },
            { $count: "count" },
          ],
          OccupantCount: [
            { $match: { role: "occupant", isProfileComplete: true } },
            { $count: "count" },
          ],
          UnverifiedCount: [
            { $match: { isProfileComplete: false } },
            { $count: "count" },
          ],
          TotalCurrent30Days: [
            {
              $match: {
                created_at: {
                  $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
            { $count: "count" },
          ],
          TotalPrevious30Days: [
            {
              $match: {
                created_at: {
                  $gte: new Date(new Date() - 60 * 24 * 60 * 60 * 1000),
                  $lt: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
            { $count: "count" },
          ],
        },
      },
      {
        $project: {
          LandlordCount: { $arrayElemAt: ["$LandlordCount.count", 0] },
          OccupantCount: { $arrayElemAt: ["$OccupantCount.count", 0] },
          UnverifiedCount: { $arrayElemAt: ["$UnverifiedCount.count", 0] },
          TotalCurrent30Days: {
            $arrayElemAt: ["$TotalCurrent30Days.count", 0],
          },
          TotalPrevious30Days: {
            $arrayElemAt: ["$TotalPrevious30Days.count", 0],
          },
          percentageChange: {
            $cond: {
              if: {
                $and: [
                  {
                    $gt: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$TotalPrevious30Days.count", 0] },
                          0,
                        ],
                      },
                      0,
                    ],
                  }, // Previous has value
                  {
                    $eq: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$TotalCurrent30Days.count", 0] },
                          0,
                        ],
                      },
                      0,
                    ],
                  }, // Current is 0
                ],
              },
              then: -99.9, // When current is 0 and previous has value, return -99.9%
              else: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          {
                            $ifNull: [
                              {
                                $arrayElemAt: ["$TotalPrevious30Days.count", 0],
                              },
                              0,
                            ],
                          },
                          0,
                        ],
                      }, // Previous is 0
                      {
                        $gt: [
                          {
                            $ifNull: [
                              {
                                $arrayElemAt: ["$TotalCurrent30Days.count", 0],
                              },
                              0,
                            ],
                          },
                          0,
                        ],
                      }, // Current has value
                    ],
                  },
                  then: 99.9, // When previous is 0 and current has value, return 100% increase
                  else: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $eq: [
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: [
                                      "$TotalPrevious30Days.count",
                                      0,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              0,
                            ],
                          }, // Both are 0
                          {
                            $eq: [
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: [
                                      "$TotalCurrent30Days.count",
                                      0,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              0,
                            ],
                          },
                        ],
                      },
                      then: 0, // When both are 0, return 0%
                      else: {
                        // Regular percentage calculation for other cases
                        $multiply: [
                          {
                            $divide: [
                              {
                                $subtract: [
                                  {
                                    $ifNull: [
                                      {
                                        $arrayElemAt: [
                                          "$TotalCurrent30Days.count",
                                          0,
                                        ],
                                      },
                                      0,
                                    ],
                                  },
                                  {
                                    $ifNull: [
                                      {
                                        $arrayElemAt: [
                                          "$TotalPrevious30Days.count",
                                          0,
                                        ],
                                      },
                                      0,
                                    ],
                                  },
                                ],
                              },
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: [
                                      "$TotalPrevious30Days.count",
                                      0,
                                    ],
                                  },
                                  0,
                                ],
                              },
                            ],
                          },
                          100,
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};

const userRegCountService = {
  async getUserCount(timeframe) {
    const currentDate = new Date();
    let counts = [];
    const result = await UserAccount.aggregate([
      {
        $facet: {
          TotalCurrent30Days: [
            {
              $match: {
                created_at: {
                  $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
            },
            { $count: "count" },
          ],
          TotalPrevious30Days: [
            {
              $match: {
                created_at: {
                  $gte: new Date(new Date() - 60 * 24 * 60 * 60 * 1000), // From 60 to 30 days ago
                  $lt: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
            { $count: "count" },
          ],
        },
      },
      {
        $project: {
          TotalCurrent30Days: { $arrayElemAt: ["$TotalCurrent30Days.count", 0] },
          TotalPrevious30Days: {
            $arrayElemAt: ["$TotalPrevious30Days.count", 0],
          },
          percentageChange: {
            $cond: {
              if: {
                $and: [
                  {
                    $gt: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$TotalPrevious30Days.count", 0] },
                          0,
                        ],
                      },
                      0,
                    ],
                  }, // Previous has value
                  {
                    $eq: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$TotalCurrent30Days.count", 0] },
                          0,
                        ],
                      },
                      0,
                    ],
                  }, // Current is 0
                ],
              },
              then: -99.9, // When current is 0 and previous has value, return -99.9%
              else: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          {
                            $ifNull: [
                              { $arrayElemAt: ["$TotalPrevious30Days.count", 0] },
                              0,
                            ],
                          },
                          0,
                        ],
                      }, // Previous is 0
                      {
                        $gt: [
                          {
                            $ifNull: [
                              { $arrayElemAt: ["$TotalCurrent30Days.count", 0] },
                              0,
                            ],
                          },
                          0,
                        ],
                      }, // Current has value
                    ],
                  },
                  then: 99.9, // When previous is 0 and current has value, return 100% increase
                  else: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $eq: [
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: [
                                      "$TotalPrevious30Days.count",
                                      0,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              0,
                            ],
                          }, // Both are 0
                          {
                            $eq: [
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: [
                                      "$TotalCurrent30Days.count",
                                      0,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              0,
                            ],
                          },
                        ],
                      },
                      then: 0, // When both are 0, return 0%
                      else: {
                        // Regular percentage calculation for other cases
                        $multiply: [
                          {
                            $divide: [
                              {
                                $subtract: [
                                  {
                                    $ifNull: [
                                      {
                                        $arrayElemAt: [
                                          "$TotalCurrent30Days.count",
                                          0,
                                        ],
                                      },
                                      0,
                                    ],
                                  },
                                  {
                                    $ifNull: [
                                      {
                                        $arrayElemAt: [
                                          "$TotalPrevious30Days.count",
                                          0,
                                        ],
                                      },
                                      0,
                                    ],
                                  },
                                ],
                              },
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: [
                                      "$TotalPrevious30Days.count",
                                      0,
                                    ],
                                  },
                                  0,
                                ],
                              },
                            ],
                          },
                          100,
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);
  
    // Debugging logs
    console.log("Aggregation Result:", result);
  
    // const totalCurrent30Days = result[0]?.TotalCurrent30Days || 0;
    // const totalPrevious30Days = result[0]?.TotalPrevious30Days || 0;
    const percentageChange =
      result[0]?.percentageChange !== null ? result[0]?.percentageChange : 0;
  
    switch (timeframe) {
      case "24h":
        for (let i = 23; i >= 0; i -= 2) {
          // Step by 2 for two-hour intervals
          const startTime = new Date(currentDate);
          startTime.setHours(currentDate.getHours() - i, 0, 0, 0); // Start of the 2-hour window
          const endTime = new Date(startTime);
          endTime.setHours(endTime.getHours() + 2); // 2-hour interval

          const count = await UserAccount.countDocuments({
            created_at: { $gte: startTime, $lt: endTime },
          });

          const startHourLabel = startTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          const endHourLabel = endTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          counts.push({ hours: `${startHourLabel} - ${endHourLabel}`, count });
        }
        break;
      case "30d":
        for (let i = 30; i >= 0; i--) {
          const startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - i);
          startDate.setUTCHours(0, 0, 0, 0); // Set the time to 00:00:00 UTC

          const endDate = new Date(startDate);
          endDate.setUTCDate(endDate.getUTCDate() + 1); // Set endDate to the next day at midnight
          endDate.setUTCHours(0, 0, 0, 0); // Ensure endDate is also at 00:00:00 UTC

          const count = await UserAccount.countDocuments({
            created_at: {
              $gte: startDate,
              $lt: endDate,
            },
          });

          const dateLabel = startDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          counts.push({ date: dateLabel, count });
        }
        break;

      case "90d":
        for (let i = 9; i >= 0; i--) {
          const startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - i * 10); // Start every 10-day window
          startDate.setUTCHours(0, 0, 0, 0); // Set the time to 00:00:00 UTC

          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 10); // 10-day interval

          const count = await UserAccount.countDocuments({
            created_at: {
              $gte: startDate,
              $lt: endDate,
            },
          });

          const startLabel = startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          const endLabel = endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          counts.push({ days: `${startLabel} - ${endLabel}`, count });
        }
        break;

      case "1y":
        for (let i = 11; i >= 0; i--) {
          const month = new Date(currentDate);
          month.setMonth(currentDate.getMonth() - i, 1); // First day of the month
          const nextMonth = new Date(month);
          nextMonth.setMonth(month.getMonth() + 1); // Next month

          const count = await UserAccount.countDocuments({
            created_at: {
              $gte: month,
              $lt: nextMonth,
            },
          });

          const monthLabel = month.toLocaleString("en-US", { month: "long" });

          counts.push({ month: monthLabel, count });
        }
        break;

      case "all":
        // Retrieve the earliest registration date from the UserAccount collection
        const earliestUser = await UserAccount.findOne(
          {},
          { created_at: 1 }
        ).sort({ created_at: 1 });
        const startDate = earliestUser ? earliestUser.created_at : currentDate; // Use current date if no users exist

        // Iterate from the start date to the current date in 3-month increments
        let currentStartDate = new Date(startDate);
        const currentEndDate = new Date(currentDate);

        while (currentStartDate < currentEndDate) {
          const nextStartDate = new Date(currentStartDate);
          nextStartDate.setMonth(currentStartDate.getMonth() + 3); // Increment by 3 months

          const count = await UserAccount.countDocuments({
            created_at: {
              $gte: currentStartDate,
              $lt: nextStartDate,
            },
          });

          // Push the counts for each three-month period
          counts.push({
            date: `${currentStartDate.toLocaleString("default", {
              month: "long",
            })} ${currentStartDate.getFullYear()}`,
            count,
          });

          // Move to the next three-month period
          currentStartDate = nextStartDate;
        }
        break;
    }

    return { counts, percentageChange};
  },
};

const getActiveUserCount = async (timeframe) => {
  const currentDate = new Date();
  let counts = [];

  switch (timeframe) {
    case "24hr":
      for (let i = 23; i >= 0; i -= 2) {
        // Every hour for the last 2 hours
        const startTime = new Date(currentDate);
        startTime.setHours(currentDate.getHours() - i, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1); // End of the hour

        const count = await UserAccount.countDocuments({
          last_login: { $gte: startTime, $lt: endTime },
        });

        counts.push({
          hour: startTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          count,
        });
      }
      break;

    case "7d":
      for (let i = 6; i >= 0; i--) {
        // Daily counts for the last 7 days
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - i);
        startDate.setUTCHours(0, 0, 0, 0);

        const count = await UserAccount.countDocuments({
          last_login: {
            $gte: startDate,
            $lt: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000), // Next day
          },
        });

        counts.push({
          date: startDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          count,
        });
      }
      break;

    case "30d":
      for (let i = 29; i >= 0; i--) {
        // Daily counts for the last 30 days
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - i);
        startDate.setUTCHours(0, 0, 0, 0);

        const count = await UserAccount.countDocuments({
          last_login: {
            $gte: startDate,
            $lt: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000), // Next day
          },
        });

        counts.push({
          date: startDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          count,
        });
      }
      break;

    case "90d":
      for (let i = 89; i >= 0; i--) {
        // Daily counts for the last 90 days
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - i);
        startDate.setUTCHours(0, 0, 0, 0);

        const count = await UserAccount.countDocuments({
          last_login: {
            $gte: startDate,
            $lt: new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000), // Next day
          },
        });

        counts.push({
          date: startDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          count,
        });
      }
      break;

    case "1y":
      for (let i = 11; i >= 0; i--) {
        // Monthly counts for the last 12 months
        const month = new Date(currentDate);
        month.setMonth(currentDate.getMonth() - i, 1); // First day of the month
        const nextMonth = new Date(month);
        nextMonth.setMonth(month.getMonth() + 1); // Next month

        const count = await UserAccount.countDocuments({
          last_login: {
            $gte: month,
            $lt: nextMonth,
          },
        });

        const monthLabel = month.toLocaleString("en-US", { month: "long" });

        counts.push({ month: monthLabel, count });
      }
      break;

    case "all":
      // Retrieve the earliest login date from the UserAccount collection
      const earliestUser = await UserAccount.findOne(
        {},
        { last_login: 1 }
      ).sort({ last_login: 1 });
      const startDate = earliestUser ? earliestUser.last_login : currentDate; // Use current date if no users exist

      // Iterate from the start date to the current date in 3-month increments
      let currentStartDate = new Date(startDate);
      const currentEndDate = new Date(currentDate);

      while (currentStartDate < currentEndDate) {
        const nextStartDate = new Date(currentStartDate);
        nextStartDate.setMonth(currentStartDate.getMonth() + 3); // Increment by 3 months

        const count = await UserAccount.countDocuments({
          last_login: {
            $gte: currentStartDate,
            $lt: nextStartDate,
          },
        });

        // Push the counts for each three-month period
        counts.push({
          date: `${currentStartDate.toLocaleString("default", {
            month: "long",
          })} ${currentStartDate.getFullYear()}`,
          count,
        });

        // Move to the next three-month period
        currentStartDate = nextStartDate;
      }
      break;

    default:
      throw new Error("Invalid timeframe");
  }

  return counts;
};

const getAllPropertyCount = async () => {
  try {
    // Aggregate the property count based on typeOfProperty
    const countByType = await PropertyList.aggregate([
      {
        // Match only Approved properties
        $match: {
          status: "Approved",
        },
      },
      {
        // Group by property type and count
        $group: {
          _id: "$typeOfProperty",
          count: { $sum: 1 },
        },
      },
      {
        // Project the final output format
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
        },
      },
    ]);

    // Calculate percentage change for the last 30 days
    const percentage = await PropertyList.aggregate([
      {
        $facet: {
          TotalCurrent30Days: [
            {
              $match: {
                approved_date: {
                  $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
            },
            { $count: "count" },
          ],
          TotalPrevious30Days: [
            {
              $match: {
                approved_date: {
                  $gte: new Date(new Date() - 60 * 24 * 60 * 60 * 1000), // From 60 to 30 days ago
                  $lt: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
            { $count: "count" },
          ],
        },
      },
      {
        $project: {
          TotalCurrent30Days: {
            $arrayElemAt: ["$TotalCurrent30Days.count", 0],
          },
          TotalPrevious30Days: {
            $arrayElemAt: ["$TotalPrevious30Days.count", 0],
          },
          percentageChange: {
            $cond: {
              if: {
                $and: [
                  {
                    $gt: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$TotalPrevious30Days.count", 0] },
                          0,
                        ],
                      },
                      0,
                    ],
                  }, // Previous has value
                  {
                    $eq: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ["$TotalCurrent30Days.count", 0] },
                          0,
                        ],
                      },
                      0,
                    ],
                  }, // Current is 0
                ],
              },
              then: -99.9, // When current is 0 and previous has value, return -99.9%
              else: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $eq: [
                          {
                            $ifNull: [
                              {
                                $arrayElemAt: ["$TotalPrevious30Days.count", 0],
                              },
                              0,
                            ],
                          },
                          0,
                        ],
                      }, // Previous is 0
                      {
                        $gt: [
                          {
                            $ifNull: [
                              {
                                $arrayElemAt: ["$TotalCurrent30Days.count", 0],
                              },
                              0,
                            ],
                          },
                          0,
                        ],
                      }, // Current has value
                    ],
                  },
                  then: 99.9, // When previous is 0 and current has value, return 100% increase
                  else: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $eq: [
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: [
                                      "$TotalPrevious30Days.count",
                                      0,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              0,
                            ],
                          }, // Both are 0
                          {
                            $eq: [
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: [
                                      "$TotalCurrent30Days.count",
                                      0,
                                    ],
                                  },
                                  0,
                                ],
                              },
                              0,
                            ],
                          },
                        ],
                      },
                      then: 0, // When both are 0, return 0%
                      else: {
                        // Regular percentage calculation for other cases
                        $multiply: [
                          {
                            $divide: [
                              {
                                $subtract: [
                                  {
                                    $ifNull: [
                                      {
                                        $arrayElemAt: [
                                          "$TotalCurrent30Days.count",
                                          0,
                                        ],
                                      },
                                      0,
                                    ],
                                  },
                                  {
                                    $ifNull: [
                                      {
                                        $arrayElemAt: [
                                          "$TotalPrevious30Days.count",
                                          0,
                                        ],
                                      },
                                      0,
                                    ],
                                  },
                                ],
                              },
                              {
                                $ifNull: [
                                  {
                                    $arrayElemAt: [
                                      "$TotalPrevious30Days.count",
                                      0,
                                    ],
                                  },
                                  0,
                                ],
                              },
                            ],
                          },
                          100,
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    // Log the current and previous counts for debugging
    const percentageChange = percentage[0]?.percentageChange ?? 0; // Default to 0 if no data
    console.log("percentage:", percentageChange);
    // Return both results and percentage change
    return { countByType, percentageChange };
  } catch (error) {
    throw error;
  }
};

const getStatusCounts = async (timeframe) => {
  const counts = [];
  const currentDate = new Date();

  switch (timeframe) {
    case "24h":
      for (let i = 23; i >= 0; i -= 2) {
        // Every 2 hours
        const startTime = new Date(currentDate);
        startTime.setHours(currentDate.getHours() - i, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2); // 2-hour window

        // Query counts for each status
        const approvedCount = await PropertyList.countDocuments({
          status: "Approved",
          approved_date: { $gte: startTime, $lt: endTime },
        });

        const rejectedCount = await PropertyList.countDocuments({
          status: "Rejected",
          rejected_date: { $gte: startTime, $lt: endTime },
        });

        const requestCount = await PropertyList.countDocuments({
          status: { $in: ["Waiting", "Under Review"] },
          created_at: { $gte: startTime, $lt: endTime },
        });

        const startHourLabel = startTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const endHourLabel = endTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        counts.push({
          hours: `${startHourLabel} - ${endHourLabel}`,
          data: {
            approved_count: approvedCount,
            rejected_count: rejectedCount,
            request_count: requestCount,
          },
        });
      }
      break;

    // case "7d":
    //   for (let i = 6; i >= 0; i--) { // Last 7 days
    //     const startDate = new Date(currentDate);
    //     startDate.setDate(currentDate.getDate() - i);
    //     startDate.setUTCHours(0, 0, 0, 0);
    //     const endDate = new Date(startDate);
    //     endDate.setDate(startDate.getDate() + 1); // Next day

    //     const approvedCount = await PropertyList.countDocuments({
    //       status: "Approved",
    //       approved_date: { $gte: startDate, $lt: endDate },
    //     });

    //     const rejectedCount = await PropertyList.countDocuments({
    //       status: "Rejected",
    //       rejected_date: { $gte: startDate, $lt: endDate },
    //     });

    //     const requestCount = await PropertyList.countDocuments({
    //       status: { $in: ["Waiting", "Under Review"] },
    //       created_at: { $gte: startDate, $lt: endDate },
    //     });

    //     counts.push({
    //       date: startDate.toLocaleDateString("en-US", {
    //         year: "numeric",
    //         month: "short",
    //         day: "numeric",
    //       }),
    //       data: [
    //         { status: "Approved", count: approvedCount },
    //         { status: "Rejected", count: rejectedCount },
    //         { status: "Request", count: requestCount },
    //       ],
    //     });
    //   }
    //   break;

    case "30d":
      for (let i = 30; i >= 0; i--) {
        // Last 30 days
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - i);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // Next day
        endDate.setUTCHours(0, 0, 0, 0); // Ensure endDate is also at 00:00:00 UTC

        const approvedCount = await PropertyList.countDocuments({
          status: "Approved",
          approved_date: { $gte: startDate, $lt: endDate },
        });

        const rejectedCount = await PropertyList.countDocuments({
          status: "Rejected",
          rejected_date: { $gte: startDate, $lt: endDate },
        });

        const requestCount = await PropertyList.countDocuments({
          status: { $in: ["Waiting", "Under Review"] },
          created_at: { $gte: startDate, $lt: endDate },
        });

        const dateLabel = startDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        counts.push({
          date: dateLabel,
          data: {
            approved_count: approvedCount,
            rejected_count: rejectedCount,
            request_count: requestCount,
          },
        });
      }
      break;

    case "90d":
      for (let i = 9; i >= 0; i--) {
        // Last 90 days
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - i * 10);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 10); // Next day

        const approvedCount = await PropertyList.countDocuments({
          status: "Approved",
          approved_date: { $gte: startDate, $lt: endDate },
        });

        const rejectedCount = await PropertyList.countDocuments({
          status: "Rejected",
          rejected_date: { $gte: startDate, $lt: endDate },
        });

        const requestCount = await PropertyList.countDocuments({
          status: { $in: ["Waiting", "Under Review"] },
          created_at: { $gte: startDate, $lt: endDate },
        });

        const startLabel = startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const endLabel = endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        counts.push({
          days: `${startLabel} - ${endLabel}`,
          data: {
            approved_count: approvedCount,
            rejected_count: rejectedCount,
            request_count: requestCount,
          },
        });
      }
      break;

    case "1y":
      for (let i = 11; i >= 0; i--) {
        // Last 12 months
        const startMonth = new Date(currentDate);
        startMonth.setMonth(currentDate.getMonth() - i, 1); // First day of the month
        const nextMonth = new Date(startMonth);
        nextMonth.setMonth(startMonth.getMonth() + 1); // Next month

        const approvedCount = await PropertyList.countDocuments({
          status: "Approved",
          approved_date: { $gte: startMonth, $lt: nextMonth },
        });

        const rejectedCount = await PropertyList.countDocuments({
          status: "Rejected",
          rejected_date: { $gte: startMonth, $lt: nextMonth },
        });

        const requestCount = await PropertyList.countDocuments({
          status: { $in: ["Waiting", "Under Review"] },
          created_at: { $gte: startMonth, $lt: nextMonth },
        });

        const monthLabel = startMonth.toLocaleString("en-US", {
          month: "long",
        });

        counts.push({
          month: monthLabel,
          data: {
            approved_count: approvedCount,
            rejected_count: rejectedCount,
            request_count: requestCount,
          },
        });
      }
      break;

    case "all":
      // Retrieve the earliest login date from the PropertyList collection
      const earliestUser = await PropertyList.findOne(
        {},
        { created_at: 1 }
      ).sort({ created_at: 1 });
      const startDate = earliestUser ? earliestUser.created_at : currentDate; // Use current date if no users exist

      // Iterate from the start date to the current date in 3-month increments
      let currentStartDate = new Date(startDate);
      const currentEndDate = new Date(currentDate);

      while (currentStartDate < currentEndDate) {
        const nextStartDate = new Date(currentStartDate);
        nextStartDate.setMonth(currentStartDate.getMonth() + 3); // Increment by 3 months

        const approvedCount = await PropertyList.countDocuments({
          status: "Approved",
          approved_date: { $gte: currentStartDate, $lt: nextStartDate },
        });

        const rejectedCount = await PropertyList.countDocuments({
          status: "Rejected",
          rejected_date: { $gte: currentStartDate, $lt: nextStartDate },
        });

        const requestCount = await PropertyList.countDocuments({
          status: { $in: ["Waiting", "Under Review"] },
          created_at: { $gte: currentStartDate, $lt: nextStartDate },
        });

        counts.push({
          date: `${currentStartDate.toLocaleString("default", {
            month: "long",
          })} ${currentStartDate.getFullYear()}`,
          data: {
            approved_count: approvedCount,
            rejected_count: rejectedCount,
            request_count: requestCount,
          },
        });

        currentStartDate = nextStartDate; // Move to the next 3-month period
      }
      break;
  }

  return counts;
};

const getPropertyCountByBarangay = async () => {
  try {
    const data = await PropertyList.aggregate([
      {
        $match: {
          status: "Approved",
        },
      },
      {
        $group: {
          _id: "$barangay",
          apartment: {
            $sum: {
              $cond: [{ $eq: ["$typeOfProperty", "Apartment"] }, 1, 0],
            },
          },
          boardinghouse: {
            $sum: {
              $cond: [{ $eq: ["$typeOfProperty", "Boarding House"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          barangay: "$_id",
          apartment: 1,
          boardinghouse: 1,
          _id: 0,
        },
      },
    ]);

    return data;
  } catch (error) {
    throw error;
  }
};

const getAveragePriceByPropertyType = async (req, res) => {
  try {
    const averagePrices = await Room.aggregate([
      {
        $lookup: {
          from: "listing_properties", // Assuming 'listing_property' is your property collection
          localField: "propertyId", // Field in Rooms collection
          foreignField: "_id", // Field in PropertyList collection
          as: "propertyDetails", // Name of the array containing the joined property data
        },
      },
      {
        $unwind: "$propertyDetails", // Unwind to convert the array into an object
      },
      {
        // Group rooms by property ID and calculate the average price of rooms for each property
        $group: {
          _id: "$propertyId", // Group by property ID
          typeOfProperty: { $first: "$propertyDetails.typeOfProperty" }, // Get property type
          averagePricePerProperty: { $avg: "$price" }, // Calculate average price of rooms for each property
        },
      },
      {
        // Now, group by typeOfProperty to calculate the overall average price per property type
        $group: {
          _id: "$typeOfProperty", // Group by property type (Apartment/Boarding House)
          averagePrice: { $avg: "$averagePricePerProperty" }, // Average price across all properties of that type
          totalProperties: { $sum: 1 }, // Count total number of properties per type
        },
      },
      {
        // Format the output
        $project: {
          _id: 0,
          propertyType: "$_id", // Property type (Apartment or Boarding House)
          averagePrice: { $round: ["$averagePrice", 2] }, // Round to 2 decimal places
          totalProperties: 1,
        },
      },
    ]);

    return averagePrices;
  } catch (error) {
    throw error;
  }
};
const getRequestCounts = async (timeframe) => {
  const counts = [];
  const currentDate = new Date();

  // Calculate percentage change for the last 30 days
  const result = await PropertyList.aggregate([
    {
      $facet: {
        TotalCurrent30Days: [
          {
            $match: {
              created_at: {
                $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
          { $count: "count" },
        ],
        TotalPrevious30Days: [
          {
            $match: {
              created_at: {
                $gte: new Date(new Date() - 60 * 24 * 60 * 60 * 1000), // From 60 to 30 days ago
                $lt: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          { $count: "count" },
        ],
      },
    },
    {
      $project: {
        TotalCurrent30Days: { $arrayElemAt: ["$TotalCurrent30Days.count", 0] },
        TotalPrevious30Days: {
          $arrayElemAt: ["$TotalPrevious30Days.count", 0],
        },
        percentageChange: {
          $cond: {
            if: {
              $and: [
                {
                  $gt: [
                    {
                      $ifNull: [
                        { $arrayElemAt: ["$TotalPrevious30Days.count", 0] },
                        0,
                      ],
                    },
                    0,
                  ],
                }, // Previous has value
                {
                  $eq: [
                    {
                      $ifNull: [
                        { $arrayElemAt: ["$TotalCurrent30Days.count", 0] },
                        0,
                      ],
                    },
                    0,
                  ],
                }, // Current is 0
              ],
            },
            then: -99.9, // When current is 0 and previous has value, return -99.9%
            else: {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: [
                        {
                          $ifNull: [
                            { $arrayElemAt: ["$TotalPrevious30Days.count", 0] },
                            0,
                          ],
                        },
                        0,
                      ],
                    }, // Previous is 0
                    {
                      $gt: [
                        {
                          $ifNull: [
                            { $arrayElemAt: ["$TotalCurrent30Days.count", 0] },
                            0,
                          ],
                        },
                        0,
                      ],
                    }, // Current has value
                  ],
                },
                then: 99.9, // When previous is 0 and current has value, return 100% increase
                else: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $eq: [
                            {
                              $ifNull: [
                                {
                                  $arrayElemAt: [
                                    "$TotalPrevious30Days.count",
                                    0,
                                  ],
                                },
                                0,
                              ],
                            },
                            0,
                          ],
                        }, // Both are 0
                        {
                          $eq: [
                            {
                              $ifNull: [
                                {
                                  $arrayElemAt: [
                                    "$TotalCurrent30Days.count",
                                    0,
                                  ],
                                },
                                0,
                              ],
                            },
                            0,
                          ],
                        },
                      ],
                    },
                    then: 0, // When both are 0, return 0%
                    else: {
                      // Regular percentage calculation for other cases
                      $multiply: [
                        {
                          $divide: [
                            {
                              $subtract: [
                                {
                                  $ifNull: [
                                    {
                                      $arrayElemAt: [
                                        "$TotalCurrent30Days.count",
                                        0,
                                      ],
                                    },
                                    0,
                                  ],
                                },
                                {
                                  $ifNull: [
                                    {
                                      $arrayElemAt: [
                                        "$TotalPrevious30Days.count",
                                        0,
                                      ],
                                    },
                                    0,
                                  ],
                                },
                              ],
                            },
                            {
                              $ifNull: [
                                {
                                  $arrayElemAt: [
                                    "$TotalPrevious30Days.count",
                                    0,
                                  ],
                                },
                                0,
                              ],
                            },
                          ],
                        },
                        100,
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);

  // Debugging logs
  console.log("Aggregation Result:", result);

  // const totalCurrent30Days = result[0]?.TotalCurrent30Days || 0;
  // const totalPrevious30Days = result[0]?.TotalPrevious30Days || 0;
  const percentageChange =
    result[0]?.percentageChange !== null ? result[0]?.percentageChange : 0;

  // console.log("Total Current 30 Days:", totalCurrent30Days);
  // console.log("Total Previous 30 Days:", totalPrevious30Days);
  // console.log("Percentage Change:", percentageChange);

  switch (timeframe) {
    case "24h":
      for (let i = 23; i >= 0; i -= 2) {
        const startTime = new Date(currentDate);
        startTime.setHours(currentDate.getHours() - i, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2);

        const requestCount = await PropertyList.countDocuments({
          created_at: { $gte: startTime, $lt: endTime },
        });

        const startHourLabel = startTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const endHourLabel = endTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        counts.push({
          hours: `${startHourLabel} - ${endHourLabel}`,
          request_count: requestCount,
        });
      }
      break;

    case "30d":
      for (let i = 30; i >= 0; i--) {
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - i);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // Next day

        const requestCount = await PropertyList.countDocuments({
          created_at: { $gte: startDate, $lt: endDate },
        });

        const dateLabel = startDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        counts.push({
          date: dateLabel,
          request_count: requestCount,
        });
      }
      break;

    case "90d":
      for (let i = 9; i >= 0; i--) {
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - i * 10);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 10);

        const requestCount = await PropertyList.countDocuments({
          created_at: { $gte: startDate, $lt: endDate },
        });

        const startLabel = startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const endLabel = endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        counts.push({
          days: `${startLabel} - ${endLabel}`,
          request_count: requestCount,
        });
      }
      break;

    case "1y":
      for (let i = 11; i >= 0; i--) {
        const startMonth = new Date(currentDate);
        startMonth.setMonth(currentDate.getMonth() - i, 1);

        const nextMonth = new Date(startMonth);
        nextMonth.setMonth(startMonth.getMonth() + 1);

        const requestCount = await PropertyList.countDocuments({
          created_at: { $gte: startMonth, $lt: nextMonth },
        });

        const monthLabel = startMonth.toLocaleString("en-US", {
          month: "long",
        });

        counts.push({
          month: monthLabel,
          request_count: requestCount,
        });
      }
      break;

    case "all":
      const earliestRequest = await PropertyList.findOne(
        {},
        { created_at: 1 }
      ).sort({ created_at: 1 });
      const startDate = earliestRequest
        ? earliestRequest.created_at
        : currentDate;

      let currentStartDate = new Date(startDate);
      const currentEndDate = new Date(currentDate);

      while (currentStartDate < currentEndDate) {
        const nextStartDate = new Date(currentStartDate);
        nextStartDate.setMonth(currentStartDate.getMonth() + 3);

        const requestCount = await PropertyList.countDocuments({
          created_at: { $gte: currentStartDate, $lt: nextStartDate },
        });

        counts.push({
          date: `${currentStartDate.toLocaleString("default", {
            month: "long",
          })} ${currentStartDate.getFullYear()}`,
          request_count: requestCount,
        });

        currentStartDate = nextStartDate;
      }
      break;
  }

  // Return the request counts along with the percentage change
  return {
    counts,
    percentageChange,
  };
};

module.exports = {
  getAllUserCount,
  userRegCountService,
  getActiveUserCount,
  getAllPropertyCount,
  getStatusCounts,
  getRequestCounts,
  getPropertyCountByBarangay,
  getAveragePriceByPropertyType,
};
