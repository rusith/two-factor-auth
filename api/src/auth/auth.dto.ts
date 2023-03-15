import {
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/typescript-types';

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorAuthData: AuthenticationResponseJSON;
}

export interface LoginResponse {
  token?: string;
  twoFactorAuthenticationOptions?: PublicKeyCredentialRequestOptionsJSON;
}
