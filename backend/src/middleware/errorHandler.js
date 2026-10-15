import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Log in development or if unhandled server error
  if (!env.isProduction || error.statusCode === 500) {
    console.error(`[Error ${error.statusCode}] ${req.method} ${req.originalUrl}:`, err);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = `Invalid format for resource identifier: "${err.value}" (field: ${err.path}).`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    error.status = 'fail';
    const validationErrors = Object.values(err.errors).map(val => val.message);
    error.message = 'Validation error occurred';
    error.details = validationErrors;
  }

  // Handle MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    error.statusCode = 409;
    error.status = 'fail';
    const fields = Object.keys(err.keyValue || {});
    const fieldName = fields[0] || 'field';
    const fieldValue = err.keyValue ? err.keyValue[fieldName] : '';
    error.message = `A student with this ${fieldName} ("${fieldValue}") already exists.`;
    error.details = [`Duplicate field value: ${fieldName}="${fieldValue}". Must be unique.`];
  }

  // Send standard JSON response
  res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message || 'An unexpected internal error occurred on the server.',
    details: error.details || err.details || null,
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
}
