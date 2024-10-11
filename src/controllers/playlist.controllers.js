import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PlayList } from "../models/playlists.model.js";

const createPlayList = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name || !description) {
      throw new apiError(400, "Name and Description are required fields.");
    }

    const playList = await PlayList.create({
      name,
      description,
      owner: req.user?._id,
    });

    if (!playList) {
      throw new apiError(
        400,
        "Playlist not created somthing went going wrong."
      );
    }

    return res
      .status(201)
      .json(new apiResponse(200, playList, "Playlist created successfully."));
  } catch (error) {
    throw new apiError(
      500,
      error.message || "Somthing went going wrong while playlist created."
    );
  }
});

const getUserPlayLists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    // Use aggregate to fetch playlists for the user
    const playLists = await PlayList.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      }, // Match playlists by userId
    ]);

    if (!playLists.length > 0) {
      throw new apiError(400, "Playlist not found");
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, { playLists }, "Playlist fetched successfully.")
      );
  } catch (error) {
    throw new apiError(
      500,
      error.message || "Somthing went wrong while get user playlist."
    );
  }
});

const getPlayListById = asyncHandler(async (req, res) => {
  const { playListId } = req.params;
  console.log("playListId: ", playListId);

  try {
    if (!mongoose.Types.ObjectId.isValid(playListId)) {
      throw new apiError(400, "Invalid playlist id");
    }

    // Find the playlist by ID
    const playList = await PlayList.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(playListId),
        },
      },
    ]);

    if (!playList.length > 0) {
      throw new apiError(400, "Playlist not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, playList, "Playlist fetched successfully"));
  } catch (error) {
    throw new Error(
      500,
      error.message || "Somthing went wrong while fetched playlist by id"
    );
  }
});

const addVideoToPlayList = asyncHandler(async (req, res) => {
  const { playListId, videoId } = req.params;

  try {
    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(playListId) ||
      !mongoose.Types.ObjectId.isValid(videoId)
    ) {
      throw new apiError(400, "Invalid playlist or video ID.");
    }

    // Update the playlist by adding the video
    const updatedPlayList = await PlayList.findByIdAndUpdate(
      playListId,
      { $addToSet: { videos: new mongoose.Types.ObjectId(videoId) } }, // Add videoId to the videos array
      { new: true } // Return the updated document
    );

    // Check if the playlist was found and updated
    if (!updatedPlayList) {
      throw new apiError(404, "Playlist not found.");
    }

    // Send response
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          "Video added to playlist successfully.",
          updatedPlayList
        )
      );
  } catch (error) {
    // Handle errors
    throw new apiError(
      500,
      error?.message || "Something went wrong while adding video to playlist."
    );
  }
});

const removeVideoFromPlayList = asyncHandler(async (req, res) => {
  const { playListId, videoId } = req.params;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(playListId) ||
      !mongoose.Types.ObjectId.isValid(videoId)
    ) {
      throw new apiError(400, "Invalid plalist and video id.");
    }

    const removeVideo = await PlayList.findByIdAndUpdate(
      playListId,
      {
        $pull: { videos: new mongoose.Types.ObjectId(videoId) },
      },
      { new: true }
    );

    if (!removeVideo) {
      throw new apiError(400, "Video not found.");
    }

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          removeVideo,
          "Video remove from playlist successfully."
        )
      );
  } catch (error) {
    throw new apiError(
      500,
      error?.message || "Somthing went wrong while remove video from playlist."
    );
  }
});

const deletePlayList = asyncHandler(async (req, res) => {
  const { playListId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(playListId)) {
      throw new apiError(400, "Invalid playlist id");
    }

    const deletePlaylist = await PlayList.findByIdAndDelete(playListId);

    if (!deletePlaylist) {
      throw new apiError(400, "Playlist not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, "Playlist deleted was successfully."));
  } catch (error) {
    throw new apiError(
      500,
      error.message || "Somthing went wrong while playlist deleted"
    );
  }
});

const updatePlayList = asyncHandler(async (req, res) => {
  const { playListId } = req.params;
  const { name, description } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(playListId)) {
      throw new apiError(400, "Invalid playlist id");
    }

    if (!name || !description) {
      throw new apiError(400, "Title or description are required fields.");
    }

    const updatedPlaylist = await PlayList.findByIdAndUpdate(
      playListId,
      {
        name,
        description,
      },
      { new: true }
    );

    if (!updatedPlaylist) {
      throw new apiError(400, "Playlist not found");
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, updatedPlaylist, "Playlist successfully updated.")
      );
  } catch (error) {
    throw new apiError(
      500,
      error.message || "Somthing went wrong while playlist update"
    );
  }
});

export {
  createPlayList,
  getUserPlayLists,
  getPlayListById,
  addVideoToPlayList,
  removeVideoFromPlayList,
  deletePlayList,
  updatePlayList,
};
