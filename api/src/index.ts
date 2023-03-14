/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import { container } from './inversify.config';
import { ConfigProvider } from './helpers';
import { TYPES } from './types';
import { AuthController } from './auth';

const app = express();
// TODO use correct cors
app.use(cors());
app.use(express.json());

const configProvider = container.get<ConfigProvider>(TYPES.ConfigProvider);
const authController = container.get<AuthController>(TYPES.AuthController);

app.post('/api/v1/users', authController.signUp);
app.post('/api/v1/profile', authController.login);
app.post(
  '/api/v1/profile/two-factor-registrations',
  authController.getTwoFactorRegistrationOptions
);
app.post(
  '/api/v1/profile/two-factor-registrations/verify',
  authController.getTwoFactorRegistrationOptions
);

app.listen(configProvider.getPort(), () => {
  console.log(`🚀 Listening on port ${configProvider.getPort()}`);
});
