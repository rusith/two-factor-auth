import { mockRequest } from '@app/testing/testing.helpers';
import { authenticatedApi } from '../auth.middleware';

describe('authenticatedApi', () => {
  it('should send unauthorized response if the authorization header is not available', async () => {
    // arrange
    const authenticated = authenticatedApi({
      verifyAuthToken: jest.fn()
    });
    const { request, response, getStatus, getData, getContentType } =
      mockRequest();
    const next = jest.fn();

    // act
    await authenticated(request, response, next);

    // assert
    expect(next).not.toBeCalled();
    expect(getStatus()).toBe(401);
    expect(getContentType()).toBe('application/json');
    expect(getData()).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized'
    });
  });

  it('should send unauthorized response if the token is not Bearer', async () => {
    // arrange
    const authenticated = authenticatedApi({
      verifyAuthToken: jest.fn()
    });
    const { request, response, getStatus, getData, getContentType } =
      mockRequest({}, {}, { authorization: 'some_token' });
    const next = jest.fn();

    // act
    await authenticated(request, response, next);

    // assert
    expect(next).not.toBeCalled();
    expect(getStatus()).toBe(401);
    expect(getContentType()).toBe('application/json');
    expect(getData()).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized'
    });
  });

  it('should send unauthorized response if token is not available', async () => {
    // arrange
    const authenticated = authenticatedApi({
      verifyAuthToken: jest.fn()
    });
    const { request, response, getStatus, getData, getContentType } =
      mockRequest({}, {}, { authorization: 'Bearer' });
    const next = jest.fn();

    // act
    await authenticated(request, response, next);

    // assert
    expect(next).not.toBeCalled();
    expect(getStatus()).toBe(401);
    expect(getContentType()).toBe('application/json');
    expect(getData()).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized'
    });
  });

  it('should send unauthorized response if token is not verified', async () => {
    // arrange
    const authenticated = authenticatedApi({
      verifyAuthToken: jest.fn().mockResolvedValue(null)
    });
    const { request, response, getStatus, getData, getContentType } =
      mockRequest({}, {}, { authorization: 'Bearer some_token' });
    const next = jest.fn();

    // act
    await authenticated(request, response, next);

    // assert
    expect(next).not.toBeCalled();
    expect(getStatus()).toBe(401);
    expect(getContentType()).toBe('application/json');
    expect(getData()).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized'
    });
  });

  it('shold call next function if token is verified', async () => {
    // arrange
    const authenticated = authenticatedApi({
      verifyAuthToken: jest
        .fn()
        .mockImplementation((token) =>
          token === 'some_token' ? 'some_user_id' : null
        )
    });
    const { request, response } = mockRequest(
      {},
      {},
      { authorization: 'Bearer some_token' }
    );
    const next = jest.fn();

    // act
    await authenticated(request, response, next);

    // assert
    expect(next).toBeCalled();
  });

  it('should set the user ID in the locals', async () => {
    // arrange
    const authenticated = authenticatedApi({
      verifyAuthToken: jest
        .fn()
        .mockImplementation((token) =>
          token === 'some_token' ? 'some_user_id' : null
        )
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locals: any = {};
    const { request, response } = mockRequest(
      locals,
      {},
      { authorization: 'Bearer some_token' }
    );
    const next = jest.fn();

    // act
    await authenticated(request, response, next);

    // assert
    expect(locals.userId).toBe('some_user_id');
  });
});
