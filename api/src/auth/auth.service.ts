import { ValidationError } from '@app/errors/ValidationError';
import {
  AuthProvider,
  AuthTokenHelper,
  PublicKeyCredentialCreationOptions,
  RegistrationResponse,
  UtilHelper
} from '@app/helpers';
import { DBProvider } from '@app/helpers/db-provider';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { AuthService } from '.';
import { LoginRequest, LoginResponse } from './auth.dto';

@injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @inject(TYPES.UtilHelper) private readonly utilHelper: UtilHelper,
    @inject(TYPES.AuthTokenHelper)
    private readonly authTokenHelper: AuthTokenHelper,
    @inject(TYPES.DBProvider)
    private readonly dbProvider: DBProvider,
    @inject(TYPES.AuthProvider)
    private readonly authProvider: AuthProvider
  ) {}

  async login(data: LoginRequest): Promise<LoginResponse> {
    const prismaClient = this.dbProvider.createClient();
    if (!data.email) {
      throw new ValidationError('Email is required');
    }
    if (!data.password) {
      throw new ValidationError('Password is required');
    }

    const user = await prismaClient.user.findFirst({
      where: {
        email: data.email
      },
      include: {
        userAuthenticators: true
      }
    });

    if (!user) {
      throw new ValidationError('Invalid email or password');
    }

    const hashedPassword = this.utilHelper.saltHashPassword(
      data.password,
      user.salt
    );

    if (hashedPassword !== user.password) {
      throw new ValidationError('Invalid email or password');
    }

    if (user.userAuthenticators.length > 0) {
      if (!data.twoFactorAuthData) {
        return {
          twoFactorAuthenticationOptions:
            await this.authProvider.generateAuthenticationOptions(
              user.id,
              user.userAuthenticators
            )
        };
      }

      if (
        await this.authProvider.verifyAuthenticationResponse(
          data.twoFactorAuthData,
          user.currentChallenge ?? '',
          user.userAuthenticators
        )
      ) {
        return {
          token: `Bearer ${await this.authTokenHelper.generateAuthToken(
            user.id
          )}`
        };
      }

      throw new ValidationError('Failed to verify two-factor authentication');
    }

    const token = await this.authTokenHelper.generateAuthToken(user.id);
    return {
      token: `Bearer ${token}`
    };
  }

  async getTwoFactorRegistrationOptions(
    userId: string
  ): Promise<PublicKeyCredentialCreationOptions> {
    const dbClient = this.dbProvider.createClient();
    const user = await dbClient.user.findFirst({ where: { id: userId } });

    if (!user) {
      throw new ValidationError('Invalid User');
    }

    const userAuthenticators = await dbClient.userAuthenticator.findMany({
      where: { userId }
    });

    return await this.authProvider.generateRegistrationOptions(
      user,
      userAuthenticators
    );
  }

  async verifyTwoFactorRegistration(
    data: RegistrationResponse,
    userId: string
  ): Promise<boolean> {
    const dbClient = this.dbProvider.createClient();
    const user = await dbClient.user.findFirst({ where: { id: userId } });

    if (!user || !user.currentChallenge) {
      throw new ValidationError('Invalid User');
    }

    return this.authProvider.verifyRegistrationResponse(data, user);
  }

  async removeTwoFactorRegistration(userId: string): Promise<void> {
    const dbClient = this.dbProvider.createClient();

    await dbClient.userAuthenticator.deleteMany({
      where: { userId }
    });
  }
}
