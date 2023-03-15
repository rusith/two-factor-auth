export interface BaseResponse<T> {
  success: boolean;
  errors: string[] | null;
  data: T | null;
}
