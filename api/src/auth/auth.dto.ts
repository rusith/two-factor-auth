import { BaseResponse } from '@app/interfaces/base-response';
import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/typescript-types';

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignUpResponse extends BaseResponse<null> {
  success: boolean;
  errors: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorAuthData: AuthenticationResponseJSON;
}

export interface LoginResultDTO {
  token?: string;
  twoFactorAuthenticationOptions?: PublicKeyCredentialRequestOptionsJSON;
}

export interface LoginResponse extends BaseResponse<LoginResultDTO> {
  success: boolean;
  errors: string[];
}

export type TwoFactorRegistrationResponse =
  BaseResponse<PublicKeyCredentialCreationOptionsJSON>;
