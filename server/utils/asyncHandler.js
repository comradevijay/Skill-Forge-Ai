// Wraps an async route handler so thrown errors are passed to Express's
// error handling middleware instead of crashing the server.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
