export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface GetUserResponse {
  name: string;
  tfaEnabled: boolean;
}
