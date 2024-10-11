import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new apiError(400, "Invalid video id");
    }

    const comments = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      { $skip: skip },
      { $limit: limitNumber },
      {
        $facet: {
          data: [],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    if (!comments) {
      throw new apiError(404, "Comments not found");
    }

    const totalCount = comments[0].totalCount[0]
      ? comments[0].totalCount[0].count
      : 0;

    return res.status(200).json(
      new apiResponse(
        200,
        {
          data: comments[0].data,
          totalCount,
          page: pageNumber,
          limit: limitNumber,
        },
        "Comments are fetched successfully."
      )
    );
  } catch (error) {
    throw new apiError(
      400,
      error?.message || "Somthing went wrong while get all videos fetch"
    );
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  try {
    if (!content) {
      throw new apiError(400, "Content is required field.");
    }

    const comment = await Comment.create({
      content,
      owner: req.user?._id,
      video: new mongoose.Types.ObjectId(videoId),
    });

    if (!comment) {
      throw new apiError(400, "Comment not created");
    }

    return res
      .status(201)
      .json(new apiResponse(200, comment, "Comment added successfully."));
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "Somthing went wrong while added comment."
    );
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new apiError(400, "Invalid comment id");
    }

    if (!content) {
      throw new apiError(400, "Content is required field");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content,
      },
      { new: true }
    );

    if (!updatedComment) {
      throw new apiError(404, "Comment is not found");
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, updatedComment, "Comment updated successfully")
      );
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "Somthing went wrong while updated comment."
    );
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new apiError(400, "Invalid comment id");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      throw new apiError(404, "Comment is not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, "Comment deleted successfully"));
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "Somthing went wrong while deleted comment."
    );
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
