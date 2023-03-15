/* eslint-disable @typescript-eslint/no-explicit-any */
import { container } from '@app/inversify.config';
import { mockDbProvider } from '@app/testing/testing.helpers';
import { TYPES } from '@app/types';
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { AuthProvider, ConfigProvider, UtilHelper } from '..';
import { DBProvider } from '../db-provider';

jest.mock('@simplewebauthn/server');

describe('AuthProvider', () => {
  beforeEach(() => container.snapshot());
  afterEach(() => container.restore());

  function getProvider() {
    return container.get<AuthProvider>(TYPES.AuthProvider);
  }

  function mockUtilHelper(mock: Partial<UtilHelper>) {
    container.unbind(TYPES.UtilHelper);
    container
      .bind<UtilHelper>(TYPES.UtilHelper)
      .toConstantValue(mock as UtilHelper);
  }

  function mockConfigProvider(mock: Partial<ConfigProvider>) {
    container.unbind(TYPES.ConfigProvider);
    container
      .bind<ConfigProvider>(TYPES.ConfigProvider)
      .toConstantValue(mock as ConfigProvider);
  }

  describe('generateAuthenticationOptions', () => {
    it('should call @simplewebauthn/server with the correct parameters', async () => {
      // arrange
      mockUtilHelper({
        base64ToBuffer: jest
          .fn()
          .mockImplementation((v: string) => Buffer.from(v))
      });
      jest.mocked(generateAuthenticationOptions).mockReturnValue({
        challenge: 'some_challenge'
      });
      mockDbProvider();
      const authProvider = getProvider();

      // act
      await authProvider.generateAuthenticationOptions('user_id', [
        {
          credentialID: 'some_credential_id'
        }
      ]);

      // assert
      expect(generateAuthenticationOptions).toHaveBeenCalledWith({
        allowCredentials: [
          {
            id: Buffer.from('some_credential_id'),
            type: 'public-key'
          }
        ],
        userVerification: 'preferred'
      });
    });

    it('should update the user with new challenge', async () => {
      // arrange
      mockUtilHelper({
        base64ToBuffer: jest
          .fn()
          .mockImplementation((v: string) => Buffer.from(v))
      });
      mockDbProvider();
      jest.mocked(generateAuthenticationOptions).mockReturnValue({
        challenge: 'some_challenge'
      });

      const authProvider = getProvider();
      const dbProvider = container.get<DBProvider>(TYPES.DBProvider);

      // act
      await authProvider.generateAuthenticationOptions('user_id', [
        {
          credentialID: 'some_credential_id'
        }
      ]);

      // assert
      expect(dbProvider.createClient().user.update).toHaveBeenCalledWith({
        where: { id: 'user_id' },
        data: {
          currentChallenge: 'some_challenge'
        }
      });
    });
  });

  describe('verifyAuthenticationResponse', () => {
    it('should return false if the user does not have current challenge', async () => {
      // arrange
      mockDbProvider();
      const authProvider = getProvider();

      // act
      const result = await authProvider.verifyAuthenticationResponse(
        { id: 'some_id' } as any,
        '',
        [{ id: 'auth_id' }] as any
      );

      // assert
      expect(result).toBe(false);
    });

    it('should return false if authenticator was not found in the list', async () => {
      // arrange
      mockDbProvider();
      const authProvider = getProvider();

      // act
      const result = await authProvider.verifyAuthenticationResponse(
        { id: 'some_id' } as any,
        '',
        [{ id: 'auth_id' }] as any
      );

      // assert
      expect(result).toBe(false);
    });

    it('should return false if authenticator was not found in the list', async () => {
      // arrange
      mockDbProvider();
      const authProvider = getProvider();

      // act
      const result = await authProvider.verifyAuthenticationResponse(
        { id: 'some_id' } as any,
        '',
        [{ id: 'auth_id' }] as any
      );

      // assert
      expect(result).toBe(false);
    });

    it('should call verifyAuthenticationResponse with correct values', async () => {
      // arrange
      mockDbProvider();
      mockConfigProvider({
        getAuthRelyingPartyOrigin: jest.fn().mockReturnValue('origin'),
        getAuthRelyingPartyId: jest.fn().mockReturnValue('id')
      });
      jest.mocked(verifyAuthenticationResponse).mockResolvedValue({
        verified: false
      } as any);

      const authProvider = getProvider();

      // act
      await authProvider.verifyAuthenticationResponse(
        { id: 'auth_id' } as any,
        'user_challenge',
        [
          {
            credentialID: 'auth_id',
            credentialPublicKey: 'public_key',
            counter: 1
          }
        ] as any
      );

      // assert
      expect(verifyAuthenticationResponse).toBeCalledWith({
        response: { id: 'auth_id' },
        expectedChallenge: 'user_challenge',
        expectedOrigin: 'origin',
        expectedRPID: 'id',
        authenticator: {
          credentialID: Buffer.from('auth_id', 'base64'),
          credentialPublicKey: 'public_key',
          counter: 1
        }
      });
    });

    it('should return false if verification failed', async () => {
      // arrange
      mockDbProvider();
      mockConfigProvider({
        getAuthRelyingPartyOrigin: jest.fn().mockReturnValue('origin'),
        getAuthRelyingPartyId: jest.fn().mockReturnValue('id')
      });

      jest.mocked(verifyAuthenticationResponse).mockResolvedValue({
        verified: false
      } as any);

      const authProvider = getProvider();

      // act
      const result = await authProvider.verifyAuthenticationResponse(
        { id: 'auth_id' } as any,
        'user_challenge',
        [
          {
            credentialID: 'auth_id',
            credentialPublicKey: 'public_key',
            counter: 1
          }
        ] as any
      );

      // assert
      expect(result).toBe(false);
    });
  });

  it('should update the authenticator counter', async () => {
    // arrange
    mockDbProvider();
    mockConfigProvider({
      getAuthRelyingPartyOrigin: jest.fn().mockReturnValue('origin'),
      getAuthRelyingPartyId: jest.fn().mockReturnValue('id')
    });

    jest.mocked(verifyAuthenticationResponse).mockResolvedValue({
      verified: true,
      authenticationInfo: {
        newCounter: 2
      }
    } as any);

    const authProvider = getProvider();
    const dbProvider = container.get<DBProvider>(TYPES.DBProvider);

    // act
    const result = await authProvider.verifyAuthenticationResponse(
      { id: 'auth_id' } as any,
      'user_challenge',
      [
        {
          credentialID: 'auth_id',
          credentialPublicKey: 'public_key',
          counter: 1
        }
      ] as any
    );

    // assert
    expect(result).toBe(true);
    expect(
      dbProvider.createClient().userAuthenticator.update
    ).toHaveBeenCalledWith({
      where: { credentialID: 'auth_id' },
      data: {
        counter: 2
      }
    });
  });
});
