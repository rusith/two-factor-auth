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
}

export interface AuthTokenHelper {
  generateAuthToken(userId: string): Promise<string>;
  verifyAuthToken(token: string): Promise<string | null>;
}
