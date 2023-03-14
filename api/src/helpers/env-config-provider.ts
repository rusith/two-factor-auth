import { injectable } from 'inversify';
import { ConfigProvider } from '.';

import dotenv from 'dotenv';
dotenv.config();

@injectable()
export class EnvConfigProvider implements ConfigProvider {
  getPort(): number {
    return Number(process.env.PORT) || 3000;
  }

  getAuthTokenSecret(): string {
    return process.env.AUTH_TOKEN_SECRET ?? '';
  }
  getAuthTokenIssuer(): string {
    return process.env.AUTH_TOKEN_ISSUER ?? '';
  }

  getAuthRelyingPartyId(): string {
    return process.env.AUTH_RELYING_PARTY_ID ?? '';
  }

  getAuthRelyingPartyName(): string {
    return process.env.AUTH_RELYING_PARTY_NAME ?? '';
  }

  getAuthRelyingPartyOrigin(): string {
    return process.env.AUTH_RELYING_PARTY_ORIGIN ?? '';
  }
}
