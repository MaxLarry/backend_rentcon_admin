const express = require("express");
const { protect } = require("../middleware/authMiddleware");
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
const { removeProfilePicture, uploadProfilePicture } = require("../controllers/ProfileAdminController");
const router = express.Router();

//router.get('/user-profile-requests', UserListController.getAlluserProfileRequest);
router.get("/admin", fetchAdmins);
router.post("/admin/add", addAdminUser);
router.put("/admin-remove-pic/:id", removeProfilePicture);
router.put("/admin-edit-pic/:id", uploadProfilePicture);


router.get("/landlord", fetchAllLandlords);
router.get("/occupant", fetchAllOccupants);
router.get("/user-request", fetchAllUserRequest);
router.get("/unverified-user", fetchAllUnverified);

router.put('/user-edit/:id',protect, updateUser);
router.put('/admin-edit/:id',protect, updateAdmin);
router.put('/update-status/:id',protect, updateRequestProfileStatus);

router.delete("/admin-deletion",protect, deleteAdmin);
router.delete("/selected-admin-deletion",protect, deleteSelectedAdmin);

router.delete("/landlord-deletion",protect, deleteUserLandlordWithPropertiesAndRooms);
router.delete("/selected-landlord-deletion",protect, deleteUserSelectedLandlordsandCredentials);

router.delete("/occupant-deletion",protect, deleteUserOccupant);
router.delete("/selected-occupant-deletion", deleteUserSelectedOccupants);

router.delete("/unverified-deletion", deleteUser);
router.delete("/selected-unverified-deletion",protect, deleteUserSelected);

module.exports = router;
