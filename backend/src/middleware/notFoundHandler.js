import { AppError } from '../utils/AppError.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, 404));
}
