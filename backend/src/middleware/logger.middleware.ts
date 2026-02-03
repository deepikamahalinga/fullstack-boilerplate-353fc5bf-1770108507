// request-logging.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = request;
    const requestId = uuidv4();
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Attach requestId to request object for further use
    request['requestId'] = requestId;

    // Log request
    this.logger.log({
      type: 'Request',
      requestId,
      method,
      path: originalUrl,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    // Log response when finished
    response.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      const logLevel = this.getLogLevel(statusCode);
      const logMessage = {
        type: 'Response',
        requestId,
        method,
        path: originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
        contentLength,
        timestamp: new Date().toISOString(),
      };

      switch (logLevel) {
        case 'error':
          this.logger.error(logMessage);
          break;
        case 'warn':
          this.logger.warn(logMessage);
          break;
        default:
          this.logger.log(logMessage);
      }
    });

    next();
  }

  private getLogLevel(statusCode: number): 'log' | 'warn' | 'error' {
    if (statusCode >= 500) {
      return 'error';
    }
    if (statusCode >= 400) {
      return 'warn';
    }
    return 'log';
  }
}

// app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RequestLoggingMiddleware } from './request-logging.middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}

// logger.config.ts
import { LoggerService } from '@nestjs/common';

export class CustomLogger implements LoggerService {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  log(message: any, context?: string) {
    if (this.isDevelopment) {
      console.log(`[${context}] ${JSON.stringify(message, null, 2)}`);
    } else {
      // In production, you might want to use a proper logging service
      // like Winston or Pino
      console.log(JSON.stringify({ level: 'info', message, context }));
    }
  }

  error(message: any, trace?: string, context?: string) {
    console.error(JSON.stringify({
      level: 'error',
      message,
      trace,
      context,
      timestamp: new Date().toISOString(),
    }));
  }

  warn(message: any, context?: string) {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      context,
      timestamp: new Date().toISOString(),
    }));
  }
}

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });
  await app.listen(3000);
}
bootstrap();