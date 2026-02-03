// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { RedisModule } from '@nestjs-modules/ioredis';

// Feature Modules
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { CommonModule } from './features/common/common.module';

// Entities
import { User } from './features/users/entities/user.entity';

// Guards
import { JwtAuthGuard } from './features/auth/guards/jwt-auth.guard';
import { RolesGuard } from './features/auth/guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

// Config
import { validationSchema } from './core/config/validation.schema';
import { databaseConfig } from './core/config/database.config';
import { authConfig } from './core/config/auth.config';
import { redisConfig } from './core/config/redis.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [databaseConfig, authConfig, redisConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [User],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
      inject: [ConfigService],
    }),

    // Redis
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          url: configService.get('redis.url'),
        },
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('throttle.ttl'),
        limit: configService.get('throttle.limit'),
      }),
      inject: [ConfigService],
    }),

    // Health Checks
    TerminusModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  providers: [
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}