import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUserAuth } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishVideo,
  updateVideo,
} from "../controllers/video.contoller.js";

const router = Router();

router.route("/search").get(getAllVideos);
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

router.route("/video/:videoId").get(getVideoById);

router
  .route("/update-video/:videoId")
  .patch(verifyUserAuth, upload.single("thumbnail"), updateVideo);

router.route("/delete-video/:videoId").delete(verifyUserAuth, deleteVideo);

export default router;
