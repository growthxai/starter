export interface PaginationData {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  prevPage?: number;
  nextPage?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationData;
}
