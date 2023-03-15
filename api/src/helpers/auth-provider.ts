import { TYPES } from '@app/types';
import { User, UserAuthenticator } from '@prisma/client';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server';
import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON
} from '@simplewebauthn/typescript-types';
import { inject, injectable } from 'inversify';
import {
  AuthProvider,
  ConfigProvider,
  PublicKeyCredentialRequestOptions,
  RegistrationResponse,
  UtilHelper
} from '.';
import { DBProvider } from './db-provider';

@injectable()
export class AuthProviderImpl implements AuthProvider {
  constructor(
    @inject(TYPES.UtilHelper) private readonly utilHelper: UtilHelper,
    @inject(TYPES.DBProvider) private readonly dbProvider: DBProvider,
    @inject(TYPES.ConfigProvider)
    private readonly configProvider: ConfigProvider
  ) {}

  async verifyAuthenticationResponse(
    response: AuthenticationResponseJSON,
    userCurrentChallenge: string,
    authenticators: UserAuthenticator[]
  ): Promise<boolean> {
    if (!userCurrentChallenge) {
      return false;
    }

    const authenticator = authenticators.find((a) =>
      Buffer.from(a.credentialID, 'base64').compare(Buffer.from(response.id))
    );

    if (!authenticator) {
      return false;
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: userCurrentChallenge,
      expectedOrigin: this.configProvider.getAuthRelyingPartyOrigin(),
      expectedRPID: this.configProvider.getAuthRelyingPartyId(),
      authenticator: {
        credentialID: this.utilHelper.base64ToBuffer(
          authenticator.credentialID
        ),
        credentialPublicKey: authenticator.credentialPublicKey,
        counter: Number(authenticator.counter)
      }
    });

    if (!verification.verified || !verification.authenticationInfo) {
      return false;
    }

    this.dbProvider.createClient().userAuthenticator.update({
      where: { credentialID: authenticator.credentialID },
      data: {
        counter: verification.authenticationInfo.newCounter
      }
    });

    return verification.verified;
  }

  async generateAuthenticationOptions(
    userId: string,
    authenticators: Pick<UserAuthenticator, 'credentialID'>[]
  ): Promise<PublicKeyCredentialRequestOptions> {
    const options = generateAuthenticationOptions({
      allowCredentials: authenticators.map((authenticator) => ({
        id: this.utilHelper.base64ToBuffer(authenticator.credentialID),
        type: 'public-key'
      })),
      userVerification: 'preferred'
    });

    await this.dbProvider.createClient().user.update({
      where: {
        id: userId
      },
      data: {
        currentChallenge: options.challenge
      }
    });

    return options;
  }

  async generateRegistrationOptions(
    user: Pick<User, 'id' | 'email' | 'name'>,
    authenticators: Pick<UserAuthenticator, 'credentialID'>[]
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const options = generateRegistrationOptions({
      rpName: this.configProvider.getAuthRelyingPartyName(),
      rpID: this.configProvider.getAuthRelyingPartyId(),
      userID: user.id,
      userName: user.email,
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials: authenticators.map((authenticator) => ({
        id: Buffer.from(authenticator.credentialID, 'base64'),
        type: 'public-key'
      }))
    });

    await this.dbProvider.createClient().user.update({
      where: { id: user.id },
      data: {
        currentChallenge: options.challenge
      }
    });

    return options;
  }

  async verifyRegistrationResponse(
    data: RegistrationResponse,
    user: Pick<User, 'id' | 'currentChallenge'>
  ): Promise<boolean> {
    const verification = await verifyRegistrationResponse({
      response: data,
      expectedChallenge: user.currentChallenge ?? '',
      expectedOrigin: this.configProvider.getAuthRelyingPartyOrigin(),
      expectedRPID: this.configProvider.getAuthRelyingPartyId()
    });

    if (verification.verified && verification.registrationInfo) {
      await this.dbProvider.createClient().userAuthenticator.create({
        data: {
          userId: user.id,
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
}
