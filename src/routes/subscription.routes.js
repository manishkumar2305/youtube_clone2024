import { Router } from "express";
import { verifyUserAuth } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controllers.js";

const router = Router();

router.use(verifyUserAuth);

router
  .route("/c/:channelId")
  .get(getUserChannelSubscribers)
  .post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
