const ErrorHandler = require("../utils/errorHandler");

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //handling cast error from mongoDB
  if (err.name === "CastError") {
    const message = `Resource Not Found.Invalid : ${err.path}`;
    err = new ErrorHandler(message, 404);
  }

  //mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate : ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  //wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = "User Is Not Authenticated Or Json Web Token Is Invalid , Try Again";
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error : err.stack //will get our stack trace
  });
};

module.exports = errorHandler;
