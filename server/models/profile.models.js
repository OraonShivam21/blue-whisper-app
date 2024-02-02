const mongoose = require("mongoose");

const socialProfileSchema = new mongoose.Schema(
  {
    coverImage: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://via.placeholder.com/800x450.png`,
        localPath: "",
      },
    },
    firstName: {
      type: String,
      default: "John",
    },
    lastName: {
      type: String,
      default: "Doe",
    },
    bio: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      default: "",
    },
    countryCode: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const SocialProfile = mongoose.model("SocialProfile", socialProfileSchema);

module.exports = SocialProfile;
