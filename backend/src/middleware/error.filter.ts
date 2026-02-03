// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

// Error response interface
interface IErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  errorName?: string;
  details?: unknown;
}

// Custom error types
export class ValidationFailedException extends HttpException {
  constructor(errors: Record<string, unknown>) {
    super({ message: 'Validation failed', errors }, HttpStatus.BAD_REQUEST);
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string) {
    super(`${resource} not found`, HttpStatus.NOT_FOUND);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Prepare error response
    const errorResponse: IErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Internal server error',
    };

    // Handle different types of errors
    if (exception instanceof HttpException) {
      errorResponse.statusCode = exception.getStatus();
      errorResponse.message = exception.message;
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        errorResponse.details = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      errorResponse.message = exception.message;
      errorResponse.errorName = exception.name;
      
      // Log stack trace but don't send it in response
      this.logger.error(
        `${exception.message} ${exception.stack}`,
        'Unhandled Exception'
      );
    }

    // Remove sensitive information in production
    if (process.env.NODE_ENV === 'production') {
      delete errorResponse.errorName;
      delete errorResponse.details;
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse)
    );

    httpAdapter.reply(response, errorResponse, errorResponse.statusCode);
  }
}

// src/common/filters/index.ts
export * from './all-exceptions.filter';