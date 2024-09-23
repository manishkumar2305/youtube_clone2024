import { Router } from "express";
import { verifyUserAuth } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getAllTweets,
  updateTweet,
} from "../controllers/tweets.controllers.js";

const router = Router();

router.use(verifyUserAuth); // Apply verifyUserAuth middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/user/:userId").get(getAllTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
