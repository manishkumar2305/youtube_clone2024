import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/likes.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new apiError(400, "Invalid video id");
    }

    const likedVideo = await Like.findOne({ video: videoId });

    if (likedVideo) {
      // User is liked video, so remove the like
      await Like.deleteOne({ video: videoId });
      return res
        .status(200)
        .json(new apiResponse(200, "Unliked video successfully"));
    } else {
      // User is not liked video, so liked video
      await Like.create({
        video: videoId,
        likedBy: req.user?._id,
      });

      return res
        .status(201)
        .json(new apiResponse(200, "Liked video successfully"));
    }
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "Somthing went wrong while video's like"
    );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new apiError(400, "Invalid comment id");
    }

    const likedComment = await Like.findOne({ comment: commentId });

    if (likedComment) {
      // User is liked comment, so remove the like
      await Like.deleteOne({ comment: commentId });
      return res
        .status(200)
        .json(new apiResponse(200, "Unliked comment successfully"));
    } else {
      // User is not liked comment, so liked comment
      await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
      });

      return res
        .status(201)
        .json(new apiResponse(200, "Liked comment successfully"));
    }
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "Somthing went wrong while comment's like"
    );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      throw new apiError(400, "Invalid tweet id");
    }

    const likedTweet = await Like.findOne({ tweet: tweetId });

    if (likedTweet) {
      // User is liked tweet, so remove the like
      await Like.deleteOne({ tweet: tweetId });
      return res
        .status(200)
        .json(new apiResponse(200, "Unliked tweet successfully"));
    } else {
      // User is not liked tweet, so liked tweet
      await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
      });

      return res
        .status(201)
        .json(new apiResponse(200, "Liked tweet successfully"));
    }
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "Somthing went wrong while tweet's like"
    );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    // Find all likes by the user for videos
    const getAllLikedVideos = await Like.find({
      likedBy: new mongoose.Types.ObjectId(userId),
      video: { $exists: true },
    });

    if (!getAllLikedVideos) {
      throw new apiError(404, "Liked videos not found");
    }

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          getAllLikedVideos,
          "All liked videos fetched successfully"
        )
      );
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "Somthing went wrong while fetched all liked videos."
    );
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
