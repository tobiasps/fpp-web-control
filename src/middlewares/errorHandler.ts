import { Request, Response, NextFunction } from 'express'
import logger from '../lib/logger'

// Define your error type
export interface AppError extends Error {
    status?: number // Optional status code
}

// Error handler middleware
export function errorHandler(
    err: AppError,                // First parameter is the error object
    req: Request,                 // Incoming request
    res: Response,                // Response object
    next: NextFunction            // Used to forward the error if necessary
) {
    const statusCode = err.status || 500 // Default to 500 if no status code is defined
    const message = err.message || 'Internal Server Error'

    res.status(statusCode).json({
        error: {
            message,
            status: statusCode,
        },
    });

    // Optionally, log the error
    logger.error(err)
}