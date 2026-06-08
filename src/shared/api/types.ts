export interface ApiResponse<T> {
  data?: T;
  isSuccess: boolean;
  errorCode?: number | string;
}

export interface ValidationErrorResponse {
  errors?: { property: string; message: string }[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TokenDto {
  accessToken: string;
  refreshToken: string;
}
