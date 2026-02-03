import { z } from 'zod';

/**
 * Schema for creating a new user
 */
export const CreateUserSchema = z.object({
  /**
   * User's email address
   * @example "user@example.com"
   */
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email must not exceed 255 characters'),

  /**
   * User's password - must contain at least 8 characters,
   * 1 uppercase letter and 1 number
   * @example "Password123"
   */
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must not exceed 72 characters')
    .regex(
      /^(?=.*[A-Z])(?=.*\d).+$/,
      'Password must contain at least 1 uppercase letter and 1 number'
    ),

  /**
   * User's role for authorization
   * @example "user"
   */
  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Role must be either "admin" or "user"' }),
  }),
});

/**
 * Type definition for creating a new user
 */
export type CreateUserDto = z.infer<typeof CreateUserSchema>;

/**
 * Example usage:
 * {
 *   email: "user@example.com",
 *   password: "Password123",
 *   role: "user"
 * }
 */