function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.response?.status || err.status || 500;
  const message = err.response?.data?.message || err.message || 'Internal Server Error';
  res.status(status).json({ error: true, message });
}

module.exports = { errorHandler };
