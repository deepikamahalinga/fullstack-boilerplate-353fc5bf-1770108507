import { Role } from '@prisma/client';

export interface CreateUserDto {
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: Role;
}

export interface UserFilters {
  email?: string;
  role?: Role;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}