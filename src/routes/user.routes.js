import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
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

export default router;
