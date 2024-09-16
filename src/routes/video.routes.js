import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUserAuth } from "../middlewares/auth.middleware.js";
import { publishVideo } from "../controllers/video.contoller.js";

const router = Router();

// Upload new video route using post req
router.route("/video-upload").post(
  verifyUserAuth,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);
export default router;
