export default function (req, res, next) {
  // console.log('var')
  res.locals.token = req.cookies.token ? false : true;
  next();
}
