const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/protect");

const {
  getAllUser,
  createUser,
  getUser,
  destroyUser,
  updateUser,
  register,
  login,
  logout,
} = require("../controller/user");

router.route("/logout").get(logout);
router.route("/register").post(register);
router.route("/login").post(login);

router.route("/").get(getAllUser).post(createUser);

router.route("/:id").get(getUser).delete(destroyUser).put(updateUser);
// router
//   .route("/:id")
//   .get(protect, getUser)
//   .delete(protect, authorize("0", "1"), destroyUser)
//   .put(protect, authorize("0"), updateUser);

module.exports = router;
