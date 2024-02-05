const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  getLocalPath,
  getStaticFilePath,
  removeLocalFile,
} = require("../utils/helpers");
const {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} = require("../utils/mail");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // attach refresh token to the user document to avoid refreshing the access token with multiple refresh tokens
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser)
    throw new ApiError(409, "User with email or username already exists", []);

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
    role: role || "USER",
  });

  // unHashedToken to send to the user's mail
  // hashedToken to keep record of and validate the unHashedToken in verify email controller
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  // assign hashedToken and tokenExpiry in DB till user clicks on email verification link
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/users/verify-email/${unHashedToken}`
    ),
  });
});
