import jwt from "jsonwebtoken";

import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    throw new ApiError(401, "Authentication token is required");
  }

  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new ApiError(
      500,
      "ACCESS_TOKEN_SECRET is missing from environment variables"
    );
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decodedToken._id).select("-password");

  if (!user) {
    throw new ApiError(401, "Invalid authentication token");
  }

  req.user = user;
  next();
});

export const authorizeRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "You are not allowed to perform this action");
    }

    next();
  };
};
