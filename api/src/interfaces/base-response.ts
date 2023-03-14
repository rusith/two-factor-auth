export interface BaseResponse<T> {
  success: boolean;
  errors: string[];
  data: T;
}
