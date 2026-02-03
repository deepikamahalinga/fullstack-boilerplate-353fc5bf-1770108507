import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaService } from './core/database/prisma.service';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { RateLimiterGuard } from './core/guards/rate-limiter.guard';
import { setupSwagger } from './core/config/swagger.config';
import { corsOptions } from './core/config/cors.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const prismaService = app.get(PrismaService);

    // Enable shutdown hooks
    prismaService.enableShutdownHooks(app);

    // Global prefix
    app.setGlobalPrefix('api');

    // Security
    app.use(helmet());
    app.enableCors(corsOptions);
    app.use(compression());
    app.use(cookieParser());

    // Request pipeline
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(),
    );
    app.useGlobalGuards(new RateLimiterGuard());

    // Swagger docs
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('REST API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    setupSwagger(app, config);

    // Start server
    const port = configService.get<number>('PORT', 3000);
    await app.listen(port);

    logger.log(`Application is running on: ${await app.getUrl()}`);

    // Graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'];
    
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.log(`Received ${signal}, starting graceful shutdown`);
        await app.close();
        process.exit(0);
      });
    }

  } catch (error) {
    logger.error('Error during application bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();