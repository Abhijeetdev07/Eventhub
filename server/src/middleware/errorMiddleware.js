function errorMiddleware(err, req, res, next) {
  const statusCode = err && (err.statusCode || err.status) ? err.statusCode || err.status : 500;
  const message = err && err.message ? err.message : 'Server error';
  const details = err && err.details ? err.details : undefined;

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    message,
    details,
  });
}

module.exports = errorMiddleware;
