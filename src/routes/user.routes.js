import { Router } from "express";
import {
  avatarUpdate,
  coverImageUpdate,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  recreateAccessToken,
  registerUser,
  updateUserPassword,
  userDetaildsUpdate,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUserAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Create register route using post req
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

// Login user using post req
router.route("/login").post(loginUser);

// Secure routes
router.route("/logout").post(verifyUserAuth, logoutUser);
router.route("/refresh-token").post(recreateAccessToken);

router.route("/update-password").patch(verifyUserAuth, updateUserPassword);
router.route("/user-profile-update").patch(verifyUserAuth, userDetaildsUpdate);

router
  .route("/avatar-update")
  .patch(verifyUserAuth, upload.single("avatar"), avatarUpdate);
router
  .route("/coverImage-update")
  .patch(verifyUserAuth, upload.single("coverImage"), coverImageUpdate);

router.route("/c/:userName").get(verifyUserAuth, getUserChannelProfile);

router.route("/get-user").get(verifyUserAuth, getCurrentUser);
router.route("/watch-history").get(verifyUserAuth, getWatchHistory);

export default router;
