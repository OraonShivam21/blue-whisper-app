const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://via.placeholder.com/200x200.png`,
        localPath: "",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    loginType: {
      type: String,
      enum: ["GOOGLE", "GITHUB", "EMAIL_PASSWORD"],
      default: "EMAIL_PASSWORD",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

// for generating tokens for email verification, password reset etc.
userSchema.methods.generateTemporaryToken = function () {
  // this token should be client facing
  // for email verification unHashedToken should go into user's mail
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // this should stay in the DB to compare at the time of verification
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  // this is the expiry time for the token (2 minutes)
  const tokenExpiry = Date.now() + 2 * 60 * 1000;

  return { unHashedToken, hashedToken, tokenExpiry };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
