import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Connection pool settings
      connectionLimit: 20,
      pool: {
        min: 2,
        max: 10,
        idle: 10000, // ms
        acquire: 30000, // ms
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');

      // Soft shutdown on SIGINT and SIGTERM
      process.on('SIGINT', async () => {
        await this.$disconnect();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        await this.$disconnect();
        process.exit(0);
      });
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
      throw error;
    }
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }

  // Transaction helper with automatic rollback on error
  async executeTransaction<T>(
    fn: (prisma: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    try {
      return await this.$transaction(async (prisma) => {
        return await fn(prisma);
      }, {
        maxWait: 5000, // max time to wait for transaction to start
        timeout: 10000, // max time for entire transaction
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable // strongest isolation level
      });
    } catch (error) {
      this.logger.error('Transaction failed', error);
      throw error;
    }
  }

  // Custom error handler middleware
  async handleError(error: Error): Promise<void> {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      switch (error.code) {
        case 'P2002':
          throw new Error('Unique constraint violation');
        case 'P2025':
          throw new Error('Record not found');
        default:
          throw error;
      }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      throw new Error('Database validation error');
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error('Database initialization error', error);
      // Attempt to reconnect
      try {
        await this.$connect();
      } catch (reconnectError) {
        throw new Error('Failed to reconnect to database');
      }
    } else {
      throw error;
    }
  }

  // Method to clear connection pool (useful for testing)
  async clearConnectionPool(): Promise<void> {
    try {
      await this.$disconnect();
      await this.$connect();
    } catch (error) {
      this.logger.error('Failed to clear connection pool', error);
      throw error;
    }
  }

  // Middleware for query logging in development
  private enableQueryLogging() {
    if (process.env.NODE_ENV === 'development') {
      this.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        this.logger.debug(
          `Query ${params.model}.${params.action} took ${after - before}ms`
        );
        return result;
      });
    }
  }
}