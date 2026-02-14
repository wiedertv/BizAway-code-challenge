export interface StandardResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    traceId?: string;
    timestamp: string;
    // pagination?: { page: number, limit: number, total: number };
  };
}
