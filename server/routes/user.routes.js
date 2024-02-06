const { Router } = require("express");
const passport = require("passport");
const {
  assignRole,
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  handleSocialLogin,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  updateUserAvatar,
  verifyEmail,
} = require("../controllers/user.controllers");
const {
  verifyJWT,
  verifyPermission,
} = require("../middlewares/auth.middlewares");

