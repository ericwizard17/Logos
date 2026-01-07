/**
 * Error handling utilities
 */

export class AppError extends Error {
    public readonly code: string;
    public readonly status: number;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        code: string = 'UNKNOWN_ERROR',
        status: number = 500,
        isOperational: boolean = true
    ) {
        super(message);
        this.code = code;
        this.status = status;
        this.isOperational = isOperational;
        
        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

// Specific error types
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 'AUTH_ERROR', 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Permission denied') {
        super(message, 'FORBIDDEN', 403);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 'NOT_FOUND', 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 'CONFLICT', 409);
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(message, 'RATE_LIMIT', 429);
    }
}

export class NetworkError extends AppError {
    constructor(message: string = 'Network error occurred') {
        super(message, 'NETWORK_ERROR', 0, false);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string) {
        super(message, 'DATABASE_ERROR', 500);
    }
}

/**
 * Parse Supabase error into AppError
 */
export function parseSupabaseError(error: unknown): AppError {
    if (error instanceof AppError) {
        return error;
    }

    const err = error as { message?: string; code?: string; status?: number };
    const message = err?.message || 'An unexpected error occurred';
    const code = err?.code || 'UNKNOWN_ERROR';

    // Map Supabase error codes to appropriate error types
    if (code === 'PGRST116' || code === '22P02') {
        return new NotFoundError('Resource');
    }
    if (code === '23505') {
        return new ConflictError('Resource already exists');
    }
    if (code === '42501' || code === 'PGRST301') {
        return new AuthorizationError();
    }
    if (code === 'PGRST204') {
        return new ValidationError('Invalid request');
    }

    return new AppError(message, code, err?.status || 500);
}

/**
 * Format error for display to user
 */
export function formatErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.message;
    }
    
    if (error instanceof Error) {
        // Don't expose internal error details in production
        if (process.env.NODE_ENV === 'production') {
            return 'An unexpected error occurred. Please try again.';
        }
        return error.message;
    }
    
    return 'An unexpected error occurred';
}

/**
 * Log error (can be extended to send to error tracking service)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    
    if (error instanceof AppError) {
        console.error(`[${timestamp}] [${error.code}] ${error.message}`, {
            ...context,
            stack: error.stack,
            status: error.status,
            isOperational: error.isOperational,
        });
    } else if (error instanceof Error) {
        console.error(`[${timestamp}] [ERROR] ${error.message}`, {
            ...context,
            stack: error.stack,
        });
    } else {
        console.error(`[${timestamp}] [UNKNOWN] Unknown error`, {
            ...context,
            error,
        });
    }
    
    // TODO: Send to error tracking service (Sentry, etc.)
}

/**
 * Async error wrapper for try-catch
 */
export async function tryCatch<T>(
    fn: () => Promise<T>,
    errorHandler?: (error: AppError) => void
): Promise<{ data: T | null; error: AppError | null }> {
    try {
        const data = await fn();
        return { data, error: null };
    } catch (err) {
        const appError = parseSupabaseError(err);
        logError(appError);
        errorHandler?.(appError);
        return { data: null, error: appError };
    }
}

