import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
    success: boolean;
    message: string;
    errors?: any;
    stack?: string;
}

class ErrorHandler extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let error = { ...err };
    error.message = err.message;

    console.error(err);

    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new ErrorHandler(message, 404);
    }

    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ErrorHandler(message, 400);
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map((val: any) => val.message)
            .join(', ');
        error = new ErrorHandler(message, 400);
    }

    const response: ErrorResponse = {
        success: false,
        message: error.message || 'Server Error'
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(error.statusCode || 500).json(response);
};

export { ErrorHandler, errorHandler };
