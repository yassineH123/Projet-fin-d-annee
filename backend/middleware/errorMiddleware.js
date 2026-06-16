function notFound(req, res) {
  res.status(404).json({ message: `Route introuvable: ${req.originalUrl}` });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({ message: err.message || 'Erreur serveur interne.' });
}

module.exports = { notFound, errorHandler };