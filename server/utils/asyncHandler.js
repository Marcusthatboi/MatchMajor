/**
 * Async handler wrapper for Express controllers
 * Automatically catches errors and passes them to error middleware
 * Prevents need for try-catch blocks in every controller
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next);
};

module.exports = asyncHandler;
