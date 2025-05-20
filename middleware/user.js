import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function (req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    next();
    return;
  }
  const openToken = jwt.verify(token, process.env.JWT_SECRET);
  // console.log("openToken:  ", openToken);
  const currentUser = await User.findById(openToken.userId);
  // console.log("currentUser:  ", currentUser);
  req.userId = currentUser._id;
  next();
}
