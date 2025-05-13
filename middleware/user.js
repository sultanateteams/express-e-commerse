import jwt from "jsonwebtoken";

export default function (req, res, next) {
  if (!req.cookies.token) {
    res.redirect("/");
    return;
  }

  const token = req.cookies.token;
  const openToken = jwt.verify(token, process.env.JWT_SECRET);
   next();
}
