const express = require("express");
const {
  fetchAdmins,
  addAdminUser,
  fetchAllLandlords,
  fetchAllOccupants,
  fetchAllUserRequest,
  updateUser,
  updateAdmin,
  deleteUserLandlordWithPropertiesAndRooms,
  deleteUserSelectedLandlordsandCredentials,
  deleteUserSelectedOccupants,
  deleteUserOccupant,
  deleteAdmin,
  deleteSelectedAdmin,
  fetchAllUnverified,
  deleteUser,
  deleteUserSelected,
  updateRequestProfileStatus,
} = require("../controllers/userListController");
const router = express.Router();

//router.get('/user-profile-requests', UserListController.getAlluserProfileRequest);
router.get("/admin", fetchAdmins);
router.post("/admin/add", addAdminUser);

router.get("/landlord", fetchAllLandlords);
router.get("/occupant", fetchAllOccupants);
router.get("/user-request", fetchAllUserRequest);
router.get("/unverified-user", fetchAllUnverified);

router.put('/user-edit/:id', updateUser);
router.put('/admin-edit/:id', updateAdmin);
router.put('/update-status/:id', updateRequestProfileStatus);

router.delete("/admin-deletion", deleteAdmin);
router.delete("/selected-admin-deletion", deleteSelectedAdmin);

router.delete("/landlord-deletion", deleteUserLandlordWithPropertiesAndRooms);
router.delete("/selected-landlord-deletion", deleteUserSelectedLandlordsandCredentials);

router.delete("/occupant-deletion", deleteUserOccupant);
router.delete("/selected-occupant-deletion", deleteUserSelectedOccupants);

router.delete("/unverified-deletion", deleteUser);
router.delete("/selected-unverified-deletion", deleteUserSelected);

module.exports = router;
