import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";
import { apiResponse } from "../utils/apiResponse.js";

// Publish a new video to the database
const publishVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
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
const videoById = asyncHandler(async (treq, res) => {});

export { publishVideo };
