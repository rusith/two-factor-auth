import { ValidationError } from '@app/errors/ValidationError';
import { container } from '@app/inversify.config';
import { mockRequest } from '@app/testing/testing.helpers';
import { TYPES } from '@app/types';
import { UserController, UserService } from '..';

describe('UserController', () => {
  beforeEach(() => container.snapshot());
  afterEach(() => container.restore());

  function mockUserService(service: Partial<UserService>) {
    container.unbind(TYPES.UserService);
    container
      .bind<UserService>(TYPES.UserService)
      .toConstantValue(service as UserService);
  }

  function getController() {
    return container.get<UserController>(TYPES.UserController);
  }

  describe('signUp', () => {
    it('should respond with 400 and with correct error message for ValidationError', async () => {
      // arrange
      const signUp = jest
        .fn()
        .mockRejectedValue(new ValidationError('Invalid email or password'));

      mockUserService({
        signUp
      });
      const { request, response, getData, getStatus, getContentType } =
        mockRequest({}, { email: 'abc@gmail.com' });

      const controller = getController();

      // act
      await controller.signUp(request, response);

      // assert
      expect(getStatus()).toBe(400);
      expect(getContentType()).toBe('application/json');
      expect(getData()).toEqual({
        success: false,
        error: 'Invalid email or password',
        data: null
      });
      expect(signUp).toHaveBeenCalledWith({ email: 'abc@gmail.com' });
    });

    it('should return the value returned by the service', async () => {
      // arrange
      const signUp = jest.fn().mockResolvedValue({ someField: 'someValue' });

      mockUserService({
        signUp
      });
      const { request, response, getData, getStatus, getContentType } =
        mockRequest();

      const controller = getController();

      // act
      await controller.signUp(request, response);

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

  describe('getCurrentUser', () => {
    it('should return the value returned by the service', async () => {
      // arrange
      const getUser = jest.fn().mockResolvedValue({ someField: 'someValue' });

      mockUserService({
        getUser
      });
      const { request, response, getData, getStatus, getContentType } =
        mockRequest({ userId: 'user_id' });

      const controller = getController();

      // act
      await controller.getCurrentUser(request, response);

      // assert
      expect(getStatus()).toBe(200);
      expect(getContentType()).toBe('application/json');
      expect(getData()).toEqual({
        success: true,
        error: null,
        data: { someField: 'someValue' }
      });
      expect(getUser).toHaveBeenCalledWith('user_id');
    });
  });
});
