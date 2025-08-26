/* eslint-disable no-undef */
/* eslint-disable no-console */
const { logEvents } = require('./log_events');

const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}: ${err.message}`, 'errLog.txt');
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message,
    error: err,
  });
};

module.exports = errorHandler;
