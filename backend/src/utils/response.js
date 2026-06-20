/**
 * Standardized API response helpers.
 * Using these ensures every endpoint returns the same JSON shape,
 * making client-side error handling predictable.
 */

/**
 * Sends a successful JSON response.
 * @param {import('express').Response} res
 * @param {*} data - payload to include in `data` field
 * @param {number} [statusCode=200]
 */
export const sendSuccess = (res, data = null, statusCode = 200) => {
  const body = { success: true };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * Sends an error JSON response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 */
export const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
