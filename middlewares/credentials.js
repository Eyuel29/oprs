module.exports = (req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', origin);
  next();
};
