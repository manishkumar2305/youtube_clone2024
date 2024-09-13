import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Create access token and refresh token
const genrateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.genrateAccessToken();
    const refreshToken = await user.genrateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Somthing went wrong while genrating access and refresh token."
    );
  }
};

// Global option for cookies genrate securily
const options = {
  httpOnly: true,
  secure: true,
};

// Create register user
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, userName, password } = req.body;

  // Check all data get is correct
  if (
    [fullName, userName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required!");
  }

  // Check user is already exiest or not
  const exiestUser = await User.findOne({ userName, email });
  if (exiestUser) {
    throw new apiError(
      409,
      `${email} or ${userName} are already exiest. Please login with your email or username!`
    );
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar is required!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, "Avatar is required!");
  }

  // Register data create
  const user = await User.create({
    fullName,
    userName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Somthing went wrong while registering the user!");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User created is successfully!"));
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check password
  // access token and refresh token create
  // set cookies
  // response cookies

  try {
    const { email, userName, password } = req.body;

    if ((email === "" || userName === "") && password === "") {
      throw new apiError(400, "All fields are required!");
    }

    // User check
    const exiestenceUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (!exiestenceUser) {
      throw new apiError(404, "User not found!");
    }

    //Password check
    const verifyPassword = await exiestenceUser.isPasswordCorrect(password);

    if (!verifyPassword) {
      throw new apiError(401, "Invalid user credential!");
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
      exiestenceUser._id
    );

    const loggedInUser = await User.findById(exiestenceUser._id).select(
      "-password -refreshToken"
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json(new apiResponse(200, loggedInUser, "User loggedin successfully!"));
  } catch (error) {
    throw new apiError(500, error);
  }
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new apiResponse(200, {}, "User logged out successfully"));
});

// Recreate access token when token expire
const recreateAccessToken = asyncHandler(async (req, res) => {
  const exiestRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!exiestRefreshToken) {
    throw new apiError(401, "Unauthorized user.");
  }

  try {
    const decodeToken = jwt.verify(
      exiestRefreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeToken?._id);

    if (!user) {
      throw new apiError(401, "Invalild refresh token.");
    }

    if (exiestRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh token is expire and used.");
    }

    const { accessToken, newRefreshToken } = await genrateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token newly created successfully"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
});

// Update user password
const updateUserPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (oldPassword === "" && newPassword === "") {
      throw new apiError(400, "All fields are required");
    }

    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    console.log(isPasswordValid);

    if (!isPasswordValid) {
      throw new apiError(401, "Old password is invalid");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(
        new apiResponse(200, {}, "Your new password updated successfully.")
      );
  } catch (error) {
    throw new apiError(
      400,
      error?.message || "Somthing went wrong while passowrd updation"
    );
  }
});

// User details update
const userDetaildsUpdate = asyncHandler(async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (fullName === "" && email === "") {
      throw new apiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { fullName, email },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new apiResponse(200, user, "User details updated successfully."));
  } catch (error) {
    throw new apiError(
      400,
      error?.message || "Somthing went wrong while user details updation"
    );
  }
});

// avatar update
const avatarUpdate = asyncHandler(async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      throw new apiError(400, "Avatar is required file");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new apiError(400, "Avatar is required file");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { avatar: avatar?.url },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new apiResponse(200, user, "Avatar file updated successfully."));
  } catch (error) {
    throw new apiError(
      400,
      error?.message || "Somthing went wrong while avatar file updation"
    );
  }
});

// Cover image update
const coverImageUpdate = asyncHandler(async (req, res) => {
  try {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
      throw new apiError(400, "Avatar is required file");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
      throw new apiError(400, "Avatar is required file");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { coverImage: coverImage?.url },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new apiResponse(200, user, "Cover image file updated successfully.")
      );
  } catch (error) {
    throw new apiError(
      400,
      error?.message || "Somthing went wrong while cover image file updation"
    );
  }
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new apiResponse(200, req.user, "Current user fetched successfully"));
});

// User channel profile details
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;

  if (!userName?.trim()) {
    throw new apiError(400, "User is missing.");
  }

  const channel = await User.aggregate([
    // match user is avaliable or not or same user
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    // get channel details
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    // get subscriber details
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelIsSubcribeToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new apiError(404, "Channel is not exiest");
  }

  res
    .status(200)
    .json(new apiResponse(200, channel[0], "Channel fetch is successfully!"));
});

// Get user watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req?.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistroy",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
  ]);

  console.log("user: ", user);

  res
    .status(200)
    .json(
      200,
      new apiResponse(
        200,
        user[0].watchHistory,
        "User watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  recreateAccessToken,
  updateUserPassword,
  userDetaildsUpdate,
  avatarUpdate,
  coverImageUpdate,
  getUserChannelProfile,
  getCurrentUser,
  getWatchHistory,
};
