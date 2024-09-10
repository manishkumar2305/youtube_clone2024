import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";
import { apiResponse } from "../utils/apiResponse.js";

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

export { registerUser };
