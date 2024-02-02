const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) throw new ApiError(401, "Unauthorized request");

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    if (!user) throw new ApiError(401, "Invalid access token");

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// middleware to check logged in users for unprotected routes. The function will set the logged in user to the request object and, if no user if logged in, it will silently fail.
// only to be used for unprotected routes in which logged in user's info is needed.
const getLoggedInUserOrIgnore = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    req.user = user;
    next();
  } catch (error) {
    // fail silently
    next();
  }
});

// middleware for validating multiple user role permissions at a time, so that if we have a route which can be accessible by multiple roles, we an achieve with this middleware
const verifyPermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?._id) throw new ApiError(401, "Unauthorized request");

    if (roles.includes(req.user?.role)) next();
    else throw new ApiError(403, "You are not allowed to perform this action");
  });

module.exports = {
  verifyJWT,
  getLoggedInUserOrIgnore,
  verifyPermission,
};
