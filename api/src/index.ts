/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import { container } from './inversify.config';
import { AuthTokenHelper, ConfigProvider } from './helpers';
import { TYPES } from './types';
import { AuthController } from './auth';
import { UserController } from './user';
import { authenticatedApi } from './auth/auth.middleware';

const app = express();
app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: '*'
  })
);

app.use(express.json());

const configProvider = container.get<ConfigProvider>(TYPES.ConfigProvider);
const authController = container.get<AuthController>(TYPES.AuthController);
const userController = container.get<UserController>(TYPES.UserController);
const authTokenHelper = container.get<AuthTokenHelper>(TYPES.AuthTokenHelper);

const authenticate = authenticatedApi(authTokenHelper);

app.post('/api/v1/users', userController.signUp.bind(userController));
app.get(
  '/api/v1/users/me',
  authenticate,
  userController.getCurrentUser.bind(userController)
);
app.post('/api/v1/auth', authController.login.bind(authController));
app.get(
  '/api/v1/auth/two-factor-auth/options',
  authenticate,
  authController.getTwoFactorRegistrationOptions.bind(authController)
);
app.post(
  '/api/v1/auth/two-factor-auth/verify',
  authenticate,
  authController.verifyTwoFactorRegistration.bind(authController)
);

app.delete(
  '/api/v1/auth/two-factor-auth',
  authenticate,
  authController.removeTwoFactorRegistration.bind(authController)
);

app.listen(configProvider.getPort(), () => {
  console.log(`🚀 Listening on port ${configProvider.getPort()}`);
});
