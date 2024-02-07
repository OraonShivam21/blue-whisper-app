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
require("../passport/passport"); // importing passport config
const {
  userAssignRoleValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgottenPasswordValidator,
} = require("../validators/user.validators");
const validate = require("../validators/validate.validators");
const upload = require("../middlewares/multer.middlewares");
const {
  mongoIdPathVariableValidator,
} = require("../validators/mongodb.validators");

const router = Router();

// unsecured route
// register
router.route("register").post(userRegisterValidator(), validate, registerUser);
// login
router.route("login").post(userLoginValidator(), validate, loginUser);
// refresh token
router.route("/refresh-token").post(refreshAccessToken);
// verify email
router.route("/verify-email/:verificationToken").get(verifyEmail);
// forgot password
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
// reset password
router
  .route("/reset-password/:resetToken")
  .post(
    userResetForgottenPasswordValidator(),
    validate,
    resetForgottenPassword
  );

// secured routes
// logout
router.route("/logout").post(verifyJWT, logoutUser);
// avatar change
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
// current user
router.route("/current-user").get(verifyJWT, getCurrentUser);
// change password
router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  );
// resend email verification
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);
// assign role
router
  .route("/assign-role/:userId")
  .post(
    verifyJWT,
    verifyPermission(["ADMIN"]),
    mongoIdPathVariableValidator("userId"),
    userAssignRoleValidator(),
    validate,
    assignRole
  );

// SSO routes
// google
router
  .route("/google")
  .get(
    passport.authenticate("google", { scope: ["profile", "email"] }),
    (req, res) => {
      res.send("redirecting to google...");
    }
  );
// github
router
  .route("/github")
  .get(
    passport.authenticate("github", { scope: ["profile", "email"] }),
    (req, res) => {
      res.send("redirecting to github...");
    }
  );

// callback redirection
router
  .route("/google/callback")
  .get(passport.authenticate("google"), handleSocialLogin);
router
  .route("/github/callback")
  .get(passport.authenticate("github"), handleSocialLogin);

module.exports = router;
