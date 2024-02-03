const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // this storage needs public/images folder in the root directory
    cb(null, "./public/images");
  },
  // store file in a .png/.jpeg/.jpg format instead of binary format
  filename: function (req, file, cb) {
    let fileExtension = "";
    if (file.originalname.split(".").length > 1) {
      fileExtension = file.originalname.substring(
        file.originalname.lastIndexOf(".")
      );
    }
    const filenameWithoutExtension = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-")
      ?.split(".")[0];
    cb(
      null,
      filenameWithoutExtension +
        Date.now() +
        Math.ceil(Math.random() * 1e5) + // to avoid rare name conflict
        fileExtension
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1000 * 1000,
  },
});

module.exports = upload;
