import { BaseResponse } from '@app/shared/interfaces/base-response';
import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/typescript-types';

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
