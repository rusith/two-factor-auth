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
    origin: '*',
    preflightContinue: true
  })
);

app.use(express.json());

const configProvider = container.get<ConfigProvider>(TYPES.ConfigProvider);
const authController = container.get<AuthController>(TYPES.AuthController);
const userController = container.get<UserController>(TYPES.UserController);
const authTokenHelper = container.get<AuthTokenHelper>(TYPES.AuthTokenHelper);

const authenticate = authenticatedApi(authTokenHelper);

app.post('/api/v1/users', userController.signUp);
app.post('/api/v1/profile', authController.login);
app.get(
  '/api/v1/profile/two-factor-auth/options',
  authenticate,
  authController.getTwoFactorRegistrationOptions
);
app.post(
  '/api/v1/profile/two-factor-auth/verify',
  authenticate,
  authController.getTwoFactorRegistrationOptions
);

app.listen(configProvider.getPort(), () => {
  console.log(`🚀 Listening on port ${configProvider.getPort()}`);
});
