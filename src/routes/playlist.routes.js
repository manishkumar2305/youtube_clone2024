import { Router } from "express";
import { verifyUserAuth } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlayList,
  createPlayList,
  deletePlayList,
  getPlayListById,
  getUserPlayLists,
  removeVideoFromPlayList,
  updatePlayList,
} from "../controllers/playlist.controllers.js";

const router = Router();

router.use(verifyUserAuth); // Apply verifyUserAuth middleware to all routes in this file

router.route("/").post(createPlayList);

router
  .route("/:playListId")
  .get(getPlayListById)
  .patch(updatePlayList)
  .delete(deletePlayList);

router.route("/add/:videoId/:playListId").patch(addVideoToPlayList);
router.route("/remove/:videoId/:playListId").patch(removeVideoFromPlayList);

router.route("/user/:userId").get(getUserPlayLists);

export default router;
