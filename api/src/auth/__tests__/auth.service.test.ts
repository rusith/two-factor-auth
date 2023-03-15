/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundError } from '@app/errors/NotFoundError';
import { ValidationError } from '@app/errors/ValidationError';
import { AuthProvider, AuthTokenHelper, UtilHelper } from '@app/helpers';
import { container } from '@app/inversify.config';
import { mockDbProvider } from '@app/testing/testing.helpers';
import { TYPES } from '@app/types';
import { AuthService } from '..';

describe('AuthService', () => {
  beforeEach(() => container.snapshot());
  afterEach(() => container.restore());

  function getService() {
    return container.get<AuthService>(TYPES.AuthService);
  }

  function mockUtilHelper(mock: Partial<UtilHelper>) {
    container.unbind(TYPES.UtilHelper);
    container
      .bind<UtilHelper>(TYPES.UtilHelper)
      .toConstantValue(mock as UtilHelper);
  }

  function mockAuthProvider(authProvider: Partial<AuthProvider>) {
    container.unbind(TYPES.AuthProvider);
    container.bind(TYPES.AuthProvider).toConstantValue(authProvider);
  }

  function mockAuthTokenHelper(mock: Partial<AuthTokenHelper>) {
    container.unbind(TYPES.AuthTokenHelper);
    container
      .bind<AuthTokenHelper>(TYPES.AuthTokenHelper)
      .toConstantValue(mock as AuthTokenHelper);
  }

  describe('login', () => {
    it('should throw a validation error if the email is not provided', async () => {
      // arrange
      const service = getService();

      // act
      const result = service.login({ email: '', password: '' });

      // assert
      await expect(result).rejects.toThrow(
        new ValidationError('Email is required')
      );
    });

    it('should throw a validation error if the password is not provided', async () => {
      // arrange
      const service = getService();

      // act
      const result = service.login({ email: 'some@email.com', password: '' });

      // assert
      await expect(result).rejects.toThrow(
        new ValidationError('Password is required')
      );
    });

    it('should throw a validation error if the password is not provided', async () => {
      // arrange
      const service = getService();

      // act
      const result = service.login({ email: 'some@email.com', password: '' });

      // assert
      await expect(result).rejects.toThrow(
        new ValidationError('Password is required')
      );
    });

    it('should throw validation error if the user does not exist', async () => {
      // arrange
      mockDbProvider((mock) => {
        mock.user.findFirst = jest.fn().mockResolvedValue(null);
      });
      const service = getService();

      // act
      const result = service.login({
        email: 'some@email.com',
        password: 'pwd'
      });

      // assert
      await expect(result).rejects.toThrow(
        new NotFoundError('Invalid email or password')
      );
    });

    it('should throw an error if the hashed password and given password does not match', async () => {
      // arrange
      mockDbProvider((db) => {
        db.user.findFirst = jest
          .fn()
          .mockResolvedValue({ password: 'hashed_password', salt: 'salt' });
      });
      mockUtilHelper({
        saltHashPassword: jest.fn().mockImplementation((pwd, salt) => {
          if (salt === 'salt' && pwd === 'raw_password')
            return 'hashed_password';
        })
      });
      const service = getService();

      // act
      const result = service.login({
        email: 'a@b.c',
        password: 'raw_password_wrong'
      });

      // assert
      await expect(result).rejects.toThrow(
        new ValidationError('Invalid email or password')
      );
    });

    it('should generate and return twoFactorAuthenticationOptions if the user has authenticators', async () => {
      // arrnge
      mockDbProvider((db) => {
        db.user.findFirst = jest.fn().mockResolvedValue({
          id: 'user_id',
          password: 'hashed_password',
          salt: 'salt',
          userAuthenticators: [{ credentialID: 'some_credential_id' }]
        });
      });

      mockUtilHelper({
        saltHashPassword: jest.fn().mockImplementation((pwd, salt) => {
          if (salt === 'salt' && pwd === 'raw_password')
            return 'hashed_password';
        })
      });
      mockAuthProvider({
        generateAuthenticationOptions: jest.fn().mockReturnValue({
          challenge: 'some_challenge'
        })
      });

      const service = getService();

      // act
      const result = await service.login({
        email: 'a@b.c',
        password: 'raw_password'
      });

      // assert
      expect(result).toEqual({
        twoFactorAuthenticationOptions: {
          challenge: 'some_challenge'
        }
      });
    });

    it('should verify the two factor auth details if provided', async () => {
      // arrnge
      mockDbProvider((db) => {
        db.user.findFirst = jest.fn().mockResolvedValue({
          id: 'user_id',
          password: 'hashed_password',
          salt: 'salt',
          userAuthenticators: [{ credentialID: 'some_credential_id' }]
        });
      });

      mockUtilHelper({
        saltHashPassword: jest.fn().mockImplementation((pwd, salt) => {
          if (salt === 'salt' && pwd === 'raw_password')
            return 'hashed_password';
        })
      });
      mockAuthProvider({
        generateAuthenticationOptions: jest.fn().mockReturnValue({
          challenge: 'some_challenge'
        }),
        verifyAuthenticationResponse: jest.fn().mockResolvedValue(true)
      });

      mockAuthTokenHelper({
        generateAuthToken: jest.fn().mockResolvedValue('generated_token')
      });

      const service = getService();

      // act
      const result = await service.login({
        email: 'a@b.c',
        password: 'raw_password',
        twoFactorAuthData: {
          id: 'some_credential_id'
        } as any
      });

      // assert
      expect(result).toEqual({
        token: 'Bearer generated_token'
      });
    });
  });
});
