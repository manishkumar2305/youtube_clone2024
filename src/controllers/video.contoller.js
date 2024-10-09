import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

// Get all video with filters
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  // Convert page and limit to integers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  // Determine sort order
  const sortOrder = sortType === "asc" ? 1 : -1;

  // Build the query object
  const queryObject = {};

  if (query) {
    queryObject.title = { $regex: query, $options: "i" }; // Case-insensitive search
  }
  if (userId) {
    queryObject.owner = new mongoose.Types.ObjectId(userId);
  }

  try {
    // Fetch videos with pagination and sorting
    const videos = await Video.aggregate([
      { $match: queryObject },
      { $sort: { [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: limitNumber },
      {
        $facet: {
          data: [],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const totalCount = videos[0].totalCount[0]
      ? videos[0].totalCount[0].count
      : 0;

    res.status(200).json(
      new apiResponse(
        200,
        {
          data: videos[0].data,
          totalCount,
          page: pageNumber,
          limit: limitNumber,
        },
        "Get all videos successfully."
      )
    );
  } catch (error) {
    throw new apiError(
      400,
      error?.message || "Somthing went wrong while get all videos fetch"
    );
  }
});

// Publish a new video to the database
const publishVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new apiError(400, "Title and description are required");
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath && !thumbnailLocalPath) {
      throw new apiError(400, "Video and thumbnail are required files.");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile && !thumbnailFile) {
      throw new apiError(400, "Video and thumbnail files uploading error.");
    }

    const video = await Video.create({
      title,
      description,
      videoFile: videoFile.url,
      thumbnail: thumbnailFile.url,
      duration: videoFile.duration,
      owner: req?.user,
    });

    return res
      .status(201)
      .json(new apiResponse(200, video, "Video uploaded successfully"));
  } catch (err) {
    throw new apiError(
      400,
      err?.message || "Somthing went wrong while video uploading"
    );
  }
});

// Particular video by id
const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById({ _id: videoId });

    if (!video) {
      throw new apiError(404, "Video not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, video, "Video fetch successfully"));
  } catch (error) {
    throw new apiError(
      400,
      error?.message || "Somthing error while video fetching by id"
    );
  }
});

// update video
const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!(title || description)) {
      throw new apiError(400, "title and description are required files.");
    }

    const thumbnailLocalPath = req?.file?.path;

    if (!thumbnailLocalPath) {
      throw new apiError(400, "Thumbnail is required file");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
      throw new apiError(400, "Thumbnail file are not upload");
    }

    const video = await Video.findByIdAndUpdate(
      { _id: videoId },
      {
        $set: {
          title,
          description,
          thumbnail: thumbnail?.url,
        },
      },
      { new: true }
    );

    if (!video) {
      throw new apiError(400, "Video not updated");
    }

    return res
      .status(200)
      .json(new apiResponse(200, video, "Video updated successfully"));
  } catch (error) {
    throw new apiError(
      400,
      error?.message || "Somthing error while video updating"
    );
  }
});

// Delete video
const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    await Video.findByIdAndDelete({ _id: videoId });

    return res
      .status(200)
      .json(new apiResponse(200, "Video deleted successfully"));
  } catch (error) {
    throw new apiError(
      400,
      error?.message || "Somthing went wrong while video deleted."
    );
  }
});

export { publishVideo, getVideoById, updateVideo, deleteVideo, getAllVideos };
