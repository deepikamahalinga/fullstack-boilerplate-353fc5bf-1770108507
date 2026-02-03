import axios, { AxiosError, AxiosInstance } from 'axios';

// Types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  field: keyof User;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  role?: UserRole;
  email?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client
class UserApiClient {
  private client: AxiosInstance;
  private readonly baseURL: string;
  private readonly maxRetries = 3;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
    
    this.client = axios.create({
      baseURL: `${this.baseURL}/api`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any request modifications here
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        const code = error.response?.data?.code;

        // Implement retry logic for specific status codes
        if (status === 429 || status === 503) {
          const config = error.config;
          config.retryCount = config.retryCount || 0;

          if (config.retryCount < this.maxRetries) {
            config.retryCount += 1;
            const delay = Math.pow(2, config.retryCount) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.client(config);
          }
        }

        throw new ApiError(status || 500, message, code);
      }
    );
  }

  async getAllUsers(
    filters?: FilterParams,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<User>> {
    try {
      const { data } = await this.client.get('/users', {
        params: {
          ...filters,
          ...pagination,
          ...sort,
        },
      });
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const { data } = await this.client.get(`/users/${id}`);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const { data } = await this.client.post('/users', userData);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    try {
      const { data } = await this.client.put(`/users/${id}`, userData);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.client.delete(`/users/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || error.message
      );
    }
    throw new ApiError(500, 'An unexpected error occurred');
  }
}

// Export singleton instance
export const userApi = new UserApiClient();

// Export hooks-friendly async functions
export const getAllUsers = (
  filters?: FilterParams,
  pagination?: PaginationParams,
  sort?: SortParams
) => userApi.getAllUsers(filters, pagination, sort);

export const getUserById = (id: string) => userApi.getUserById(id);

export const createUser = (data: CreateUserDto) => userApi.createUser(data);

export const updateUser = (id: string, data: UpdateUserDto) =>
  userApi.updateUser(id, data);

export const deleteUser = (id: string) => userApi.deleteUser(id);