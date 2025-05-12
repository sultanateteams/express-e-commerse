export default function (req, res, next) {
  res.locals.token = req.cookies.token ? false : true;
  next();
}
