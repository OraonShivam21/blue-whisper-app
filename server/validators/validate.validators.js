const { validationResult } = require("express-validator");
const errorHandler = require("../middlewares/error.middlewares");
const ApiError = require("../utils/ApiError");

// validate middleware responsible to centralize the error checking done by the express-validator
// this checks if the request validation has errors
// if yes then it structures them and throws an ApiError which forwards the error to the errorHandler middleware which throws a uniform response at a single place
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  // 422: Unprocessable Entity
  throw new ApiError(422, "Received data is not valid", extractedErrors);
};

module.exports = validate;
