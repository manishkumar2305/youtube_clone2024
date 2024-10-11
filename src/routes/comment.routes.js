import { Router } from "express";
import { verifyUserAuth } from "../middlewares/auth.middleware.js";
import {
  addComment,
  getVideoComments,
  deleteComment,
  updateComment,
} from "../controllers/comments.controllers.js";

const router = Router();

router.use(verifyUserAuth);

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
