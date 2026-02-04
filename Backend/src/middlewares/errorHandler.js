// src/middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";

    // MongoDB invalid ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // MongoDB duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

export default errorHandler;
