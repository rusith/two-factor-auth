import { ValidationError } from '@app/errors/ValidationError';
import { container } from '@app/inversify.config';
import { mockRequest } from '@app/testing/testing.helpers';
import { TYPES } from '@app/types';
import { AuthController, AuthService } from '..';

describe('AuthController', () => {
  beforeEach(() => container.snapshot());
  afterEach(() => container.restore());

  function mockAuthService(service: Partial<AuthService>) {
    container.unbind(TYPES.AuthService);
    container
      .bind<AuthService>(TYPES.AuthService)
      .toConstantValue(service as AuthService);
  }

  function getController() {
    return container.get<AuthController>(TYPES.AuthController);
  }

  describe('login', () => {
    it('should respond with 400 and with correct error message for ValidationError', async () => {
      // arrange
      const login = jest
        .fn()
        .mockRejectedValue(new ValidationError('Invalid email or password'));

      mockAuthService({
        login
      });
      const { request, response, getData, getStatus, getContentType } =
        mockRequest();

      const controller = getController();

      // act
      await controller.login(request, response);

      // assert
      expect(getStatus()).toBe(400);
      expect(getContentType()).toBe('application/json');
      expect(getData()).toEqual({
        success: false,
        error: 'Invalid email or password',
        data: null
      });
    });

    it('should return the value returned by the service', async () => {
      // arrange
      const login = jest.fn().mockResolvedValue({ someField: 'someValue' });

      mockAuthService({
        login
      });
      const { request, response, getData, getStatus, getContentType } =
        mockRequest();

      const controller = getController();

      // act
      await controller.login(request, response);

      // assert
      expect(getStatus()).toBe(200);
      expect(getContentType()).toBe('application/json');
      expect(getData()).toEqual({
        success: true,
        error: null,
        data: { someField: 'someValue' }
      });
    });
  });

  describe('getTwoFactorRegistrationOptions', () => {
    it('should respond with 400 and with correct error message for ValidationError', async () => {
      // arrange
      const getTwoFactorRegistrationOptions = jest
        .fn()
        .mockRejectedValue(new ValidationError('Invalid user'));

      mockAuthService({
        getTwoFactorRegistrationOptions
      });
      const { request, response, getData, getStatus, getContentType } =
        mockRequest({ userId: 'user_id' });

      const controller = getController();

      // act
      await controller.getTwoFactorRegistrationOptions(request, response);

      // assert
      expect(getStatus()).toBe(400);
      expect(getContentType()).toBe('application/json');
      expect(getData()).toEqual({
        success: false,
        error: 'Invalid user',
        data: null
      });
      expect(getTwoFactorRegistrationOptions).toHaveBeenCalledWith('user_id');
    });

    it('should return the value returned by the service', async () => {
      // arrange
      const getTwoFactorRegistrationOptions = jest
        .fn()
        .mockResolvedValue({ someField: 'someValue' });

      mockAuthService({
        getTwoFactorRegistrationOptions
      });
      const { request, response, getData, getStatus, getContentType } =
        mockRequest();

      const controller = getController();

      // act
      await controller.getTwoFactorRegistrationOptions(request, response);

      // assert
      expect(getStatus()).toBe(200);
      expect(getContentType()).toBe('application/json');
      expect(getData()).toEqual({
        success: true,
        error: null,
        data: { someField: 'someValue' }
      });
    });
  });

  describe('verifyTwoFactorRegistration', () => {
    it('should respond with 400 and with correct error message for ValidationError', async () => {
      // arrange
      const verifyTwoFactorRegistration = jest
        .fn()
        .mockRejectedValue(new ValidationError('Invalid user'));

      mockAuthService({
        verifyTwoFactorRegistration
      });
      const { request, response, getData, getStatus, getContentType } =
        mockRequest({ userId: 'user_id' });

      const controller = getController();

      // act
      await controller.verifyTwoFactorRegistration(request, response);

      // assert
      expect(getStatus()).toBe(400);
      expect(getContentType()).toBe('application/json');
      expect(getData()).toEqual({
        success: false,
        error: 'Invalid user',
        data: null
      });
      expect(verifyTwoFactorRegistration).toHaveBeenCalledWith({}, 'user_id');
    });

    it('should return the value returned by the service', async () => {
      // arrange
      const verifyTwoFactorRegistration = jest
        .fn()
        .mockResolvedValue({ someField: 'someValue' });

      mockAuthService({
        verifyTwoFactorRegistration
      });
      const { request, response, getData, getStatus, getContentType } =
        mockRequest();

      const controller = getController();

      // act
      await controller.verifyTwoFactorRegistration(request, response);

      // assert
      expect(getStatus()).toBe(200);
      expect(getContentType()).toBe('application/json');
      expect(getData()).toEqual({
        success: true,
        error: null,
        data: { someField: 'someValue' }
      });
    });
  });
});
