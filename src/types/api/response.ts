export type ApiResponse<T> = {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ErrorResponse = {
  error: string;
  status: number;
}; 