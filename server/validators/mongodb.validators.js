const { body, param } = require("express-validator");

// a common validator responsible to validate mongodb ids passed in the url's path variable
const mongoIdPathVariableValidator = (idName) => {
  return [
    param(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
  ];
};

// a common validator resonsible to validate mongodb ids passed in the request body
const mongoIdRequestBodyValidator = (idName) => {
  return [body(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`)];
};

module.exports = {
  mongoIdPathVariableValidator,
  mongoIdRequestBodyValidator,
};
