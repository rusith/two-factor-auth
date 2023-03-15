export interface BaseResponse<T> {
  success: boolean;
  error: string | null;
  data: T | null;
}
