const fs = require("fs");
const mongoose = require("mongoose");

// get payload data according to the page and limit
const getPaginatedPayload = (dataArray, page, limit) => {
  const startPosition = +(page - 1) * limit;
  const totalItems = dataArray.length;
  const totalPages = Math.ceil(totalItems / limit);

  dataArray = structuredClone(dataArray).slice(
    startPosition,
    startPosition + limit
  );

  const payload = {
    page,
    limit,
    totalPages,
    previousPage: page > 1,
    nextPage: page < totalPages,
    totalItems,
    currentPageItems: dataArray?.length,
    data: dataArray,
  };

  return payload;
};

// returns the file's static path from where the server is serving the static image
const getStaticFilePath = (req, fileName) => {
  return `${req.protocol}://${req.get("host")}/images/${fileName}`;
};

// returns the file's local path in the file system to assist future removal
const getLocalPath = (fileName) => {
  return `public/images/${fileName}`;
};

// removes the local file from the local file system based on the file path
const removeLocalFile = (localPath) => {
  fs.unlink(localPath, (err) => {
    if (err) console.log("Error while removing local files:", err);
    else console.log("Removed local file:", localPath);
  });
};

// responsible for removing unused image files due to the api fail
// For example: this can occur when product is created, in product creation process the images are getting uploaded before product gets created, once images are uploaded and if there is an error creating a product, the uploaded images are unused, in such cases, this function will remove those unused images
const removeUnusedMulterImageFilesOnError = (req) => {
  try {
    const multerFile = req.file;
    const multerFiles = req.files;

    if (multerFile) {
      removeLocalFile(multerFile.path);
    }

    if (multerFiles) {
      // if there are multiple files uploaded for more than one field, we want to remove those files as well
      const filesValueArray = Object.values(multerFiles);
      filesValueArray.map((fileFields) => {
        fileFields.map((fileObject) => {
          removeLocalFile(fileObject.path);
        });
      });
    }
  } catch (error) {
    console.log("Error while removing images files:", error);
  }
};

const getMongoosePaginationOptions = ({
  page = 1,
  limit = 10,
  customLabels,
}) => {
  return {
    page: Math.max(page, 1),
    limit: Math.max(limit, 1),
    pagination: true,
    customLabels: {
      pagingCounter: "serialNumberStartFrom",
      ...customLabels,
    },
  };
};

const getRandomNumber = (max) => {
  return Math.floor(Math.random() * max);
};

module.exports = {
  getPaginatedPayload,
  getStaticFilePath,
  getLocalPath,
  removeLocalFile,
  removeUnusedMulterImageFilesOnError,
  getMongoosePaginationOptions,
  getRandomNumber,
};
