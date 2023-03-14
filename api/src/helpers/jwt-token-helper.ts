import { inject, injectable } from 'inversify';
import { AuthTokenHelper, ConfigProvider } from '.';
import jwt from 'jsonwebtoken';
import { TYPES } from '@app/types';

@injectable()
export class JWTTokenHelper implements AuthTokenHelper {
  constructor(
    @inject(TYPES.ConfigProvider)
    private readonly configProvider: ConfigProvider
  ) {}

  generateAuthToken(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        {
          sub: userId
        },
        this.configProvider.getAuthTokenSecret(),
        {
          issuer: this.configProvider.getAuthTokenIssuer()
        },
        (err, token) => {
          if (err) {
            reject(err);
          } else {
            resolve(token ?? '');
          }
        }
      );
    });
  }

  verifyAuthToken(token: string): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      jwt.verify(
        token,
        this.configProvider.getAuthTokenSecret(),
        {
          issuer: this.configProvider.getAuthTokenIssuer()
        },
        (error, decoded) => {
          if (error) {
            reject(error);
          }
          resolve(decoded?.sub as string);
        }
      );
    });
    throw new Error('Method not implemented.');
  }
}
