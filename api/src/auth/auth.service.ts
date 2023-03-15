import { ValidationError } from '@app/errors/ValidationError';
import { AuthTokenHelper, ConfigProvider, UtilHelper } from '@app/helpers';
import { TYPES } from '@app/types';
import { PrismaClient, User, UserAuthenticator } from '@prisma/client';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server';
import {
  AuthenticationResponseJSON,
  AuthenticatorDevice,
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON
} from '@simplewebauthn/typescript-types';
import { inject, injectable } from 'inversify';
import { AuthService } from '.';
import { LoginRequest, LoginResponse } from './auth.dto';

@injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @inject(TYPES.UtilHelper) private readonly utilHelper: UtilHelper,
    @inject(TYPES.AuthTokenHelper)
    private readonly authTokenHelper: AuthTokenHelper,
    @inject(TYPES.ConfigProvider)
    private readonly configProvider: ConfigProvider
  ) {}

  async login(data: LoginRequest): Promise<LoginResponse> {
    const prismaClient = new PrismaClient();
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
            await this.generateTwoFactorAuthenticationOptions(
              user.userAuthenticators,
              user.id
            )
        };
      }

      if (
        await this.verifyTwoFactorAuthentication(
          data.twoFactorAuthData,
          user,
          user.userAuthenticators
        )
      ) {
        const token = await this.authTokenHelper.generateAuthToken(user.id);
        return {
          token: `Bearer ${token}`
        };
      }

      // TODO Should be auth error
      throw new ValidationError('Failed to verify two factor authentication');
    }

    const token = await this.authTokenHelper.generateAuthToken(user.id);
    return {
      token: `Bearer ${token}`
    };
  }

  async getTwoFactorRegistrationOptions(
    userId: string
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const prismaClient = new PrismaClient();
    const user = await prismaClient.user.findFirst({ where: { id: userId } });

    if (!user) {
      throw new ValidationError('Invalid User');
    }

    const userAuthenticators =
      await new PrismaClient().userAuthenticator.findMany({
        where: { userId }
      });

    const options = generateRegistrationOptions({
      rpName: this.configProvider.getAuthRelyingPartyName(),
      rpID: this.configProvider.getAuthRelyingPartyId(),
      userID: user.id,
      userName: user.email,
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials: userAuthenticators.map((authenticator) => ({
        id: Buffer.from(authenticator.credentialID, 'base64'),
        type: 'public-key',
        transports: authenticator.transports
          .split(',')
          .map((t) => t.trim() as AuthenticatorTransportFuture)
      }))
    });

    await prismaClient.user.update({
      where: { id: userId },
      data: {
        currentChallange: options.challenge
      }
    });

    return options;
  }

  async verifyTwoFactorRegistration(
    data: RegistrationResponseJSON,
    userId: string
  ): Promise<boolean> {
    const prismaClient = new PrismaClient();
    const user = await prismaClient.user.findFirst({ where: { id: userId } });

    if (!user || !user.currentChallange) {
      throw new ValidationError('Invalid User');
    }

    console.log(this.configProvider.getAuthRelyingPartyOrigin());

    const verification = await verifyRegistrationResponse({
      response: data,
      expectedChallenge: user.currentChallange,
      expectedOrigin: this.configProvider.getAuthRelyingPartyOrigin(),
      expectedRPID: this.configProvider.getAuthRelyingPartyId()
    });

    if (verification.verified && verification.registrationInfo) {
      await prismaClient.userAuthenticator.create({
        data: {
          userId,
          credentialID: Buffer.from(
            verification.registrationInfo.credentialID.buffer
          ).toString('base64'),
          credentialPublicKey: Buffer.from(
            verification.registrationInfo.credentialPublicKey
          ),
          counter: verification.registrationInfo.counter,
          transports: '',
          credentialBackedUp: verification.registrationInfo.credentialBackedUp,
          credentialDeviceType:
            verification.registrationInfo.credentialDeviceType
        }
      });

      return true;
    }

    return false;
  }

  private async verifyTwoFactorAuthentication(
    data: AuthenticationResponseJSON,
    user: User,
    authenticators: UserAuthenticator[]
  ) {
    // TODO Check
    if (!user.currentChallange) {
      throw new ValidationError('Invalid User');
    }

    const authenticator = authenticators.find((a) => {
      return Buffer.from(a.credentialID, 'base64').compare(
        Buffer.from(data.id)
      );
    });

    if (!authenticator) {
      throw new ValidationError('Invalid Authenticator');
    }

    const verification = await verifyAuthenticationResponse({
      response: data,
      expectedChallenge: user.currentChallange,
      expectedOrigin: this.configProvider.getAuthRelyingPartyOrigin(),
      expectedRPID: this.configProvider.getAuthRelyingPartyId(),
      authenticator:
        this.mapUserAuthenticatorToAuthenticatorDevice(authenticator)
    });

    if (!verification.verified || !verification.authenticationInfo) {
      return false;
    }

    await new PrismaClient().userAuthenticator.update({
      where: { credentialID: authenticator.credentialID },
      data: {
        counter: verification.authenticationInfo.newCounter
      }
    });

    return verification.verified;
  }

  private async generateTwoFactorAuthenticationOptions(
    authenticators: UserAuthenticator[],
    userId: string
  ) {
    const options = generateAuthenticationOptions({
      allowCredentials: authenticators.map((authenticator) => ({
        id: Buffer.from(authenticator.credentialID, 'base64'),
        type: 'public-key'
      })),
      userVerification: 'preferred'
    });

    await new PrismaClient().user.update({
      where: { id: userId },
      data: {
        currentChallange: options.challenge
      }
    });

    return options;
  }

  private mapUserAuthenticatorToAuthenticatorDevice(
    userAuthenticator: UserAuthenticator
  ): AuthenticatorDevice {
    return {
      credentialID: Buffer.from(userAuthenticator.credentialID, 'base64'),
      credentialPublicKey: userAuthenticator.credentialPublicKey,
      counter: Number(userAuthenticator.counter)
    };
  }
}
