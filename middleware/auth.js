export default function (req, res, next) {
  if (res.locals.token) {
    res.redirect("/");
    return;
  }
  next();
}
