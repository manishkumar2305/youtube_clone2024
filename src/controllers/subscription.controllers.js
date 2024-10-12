import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?.id; // Assuming user info is attached to req.user

  try {
    // Check if the user is already subscribed to the channel
    const subscription = await Subscription.findOne({
      subscriber: userId,
      channel: channelId,
    });

    if (subscription) {
      // User is subscribed, so remove the subscription
      await Subscription.deleteOne({ subscriber: userId, channel: channelId });

      return res
        .status(200)
        .json(new apiResponse(200, "Unsubscribed channel successfully"));
    } else {
      // User is not subscribed, so add a new subscription
      await Subscription.create({
        subscriber: new mongoose.Types.ObjectId(userId),
        channel: new mongoose.Types.ObjectId(channelId),
      });

      return res
        .status(201)
        .json(new apiResponse(200, "Subcribed channel successfully"));
    }
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "An error occurred while toggling subscription"
    );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      throw new apiError(400, "Invalid channel id");
    }

    const subscribers = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
    ]);

    if (!subscribers) {
      throw new apiError(404, "Subscriber not found");
    }

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          subscribers,
          "User channel subscribers fetched successfully."
        )
      );
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "Somthing went wrong while get user channel subscribers"
    );
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
      throw new apiError(400, "Invalid subscriber id");
    }

    const channels = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId),
        },
      },
    ]);

    if (!channels) {
      throw new apiError(404, "Channel not found");
    }

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          channels,
          "User channel subscribers fetched successfully."
        )
      );
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "Somthing went wrong while get user channel subscribers"
    );
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
