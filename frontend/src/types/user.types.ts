// user.types.ts

import { z } from 'zod';

/**
 * Available user roles for authorization
 * @enum {string}
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

/**
 * Base user interface containing all entity fields
 * @interface
 */
export interface User {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** Hashed password */
  password: string;
  
  /** User's role for authorization */
  role: UserRole;
  
  /** Email verification status */
  isEmailVerified: boolean;
  
  /** Timestamp of creation */
  createdAt: Date;
  
  /** Timestamp of last update */
  updatedAt: Date;
}

/**
 * Data transfer object for creating new users
 * @interface
 */
export type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isEmailVerified'>;

/**
 * Data transfer object for updating existing users
 * @interface
 */
export type UpdateUserDto = Partial<CreateUserDto>;

/**
 * Filter parameters for user queries
 * @interface
 */
export interface UserFilterParams {
  email?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
  createdAtStart?: Date;
  createdAtEnd?: Date;
}

/**
 * Pagination parameters
 * @interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Sort parameters
 * @interface
 */
export interface SortParams {
  field: keyof User;
  direction: 'asc' | 'desc';
}

/**
 * API response wrapper with metadata
 * @interface
 */
export interface ApiResponse<T> {
  data: T;
  metadata: {
    timestamp: Date;
    statusCode: number;
    message?: string;
  };
}

/**
 * Paginated API response
 * @interface
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  metadata: {
    timestamp: Date;
    statusCode: number;
    message?: string;
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

/**
 * Zod validation schema for user creation
 */
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9])/),
  role: z.nativeEnum(UserRole)
});

/**
 * Zod validation schema for user updates
 */
export const updateUserSchema = createUserSchema.partial();

/**
 * Zod validation schema for filter params
 */
export const filterParamsSchema = z.object({
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isEmailVerified: z.boolean().optional(),
  createdAtStart: z.date().optional(),
  createdAtEnd: z.date().optional()
});

/**
 * Type guard to check if an unknown value is a valid User
 */
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'password' in value &&
    'role' in value
  );
}

/**
 * Utility type for user session data
 */
export type UserSession = Pick<User, 'id' | 'email' | 'role'>;

/**
 * Utility type for public user profile data
 */
export type UserProfile = Omit<User, 'password'>;