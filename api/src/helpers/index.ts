import { User, UserAuthenticator } from '@prisma/client';
import { GenerateRegistrationOptionsOpts } from '@simplewebauthn/server';
import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON
} from '@simplewebauthn/typescript-types';

export interface ConfigProvider {
  getPort(): number;

  getAuthRelyingPartyId(): string;
  getAuthRelyingPartyName(): string;
  getAuthRelyingPartyOrigin(): string;

  getAuthTokenSecret(): string;
  getAuthTokenIssuer(): string;
}

export interface UtilHelper {
  getUniqueString(length: number): string;
  saltHashPassword(password: string, salt: string): string;
  base64ToBuffer(base64: string): Buffer;
}

export interface AuthTokenHelper {
  generateAuthToken(userId: string): Promise<string>;
  verifyAuthToken(token: string): Promise<string | null>;
}

export type PublicKeyCredentialRequestOptions =
  PublicKeyCredentialRequestOptionsJSON;

export type AuthenticationResponse = AuthenticationResponseJSON;

export type PublicKeyCredentialCreationOptions =
  PublicKeyCredentialCreationOptionsJSON;

export type RegistrationResponse = RegistrationResponseJSON;

export interface AuthProvider {
  generateAuthenticationOptions(
    userId: string,
    authenticators: Pick<UserAuthenticator, 'credentialID'>[]
  ): Promise<PublicKeyCredentialRequestOptionsJSON>;

  verifyAuthenticationResponse(
    response: AuthenticationResponse,
    userCurrentChallenge: string,
    authenticators: UserAuthenticator[]
  ): Promise<boolean>;

  generateRegistrationOptions(
    user: Pick<User, 'id' | 'email' | 'name'>,
    authenticators: Pick<UserAuthenticator, 'credentialID'>[]
  ): Promise<PublicKeyCredentialCreationOptions>;

  verifyRegistrationResponse(
    data: RegistrationResponse,
    user: Pick<User, 'id' | 'currentChallenge'>
  ): Promise<boolean>;
}
