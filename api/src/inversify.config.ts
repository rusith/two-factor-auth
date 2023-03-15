import { Container } from 'inversify';
import 'reflect-metadata';
import {
  AuthProvider,
  AuthTokenHelper,
  ConfigProvider,
  UtilHelper
} from '@app/helpers';
import { EnvConfigProvider } from '@app/helpers/env-config-provider';
import { TYPES } from '@app/types';
import { UserController, UserService } from '@app/user';
import { UserControllerImpl } from '@app/user/user.controller';
import { AuthControllerImpl } from '@app/auth/auth.controller';
import { AuthController, AuthService } from '@app/auth';
import { AuthServiceImpl } from '@app/auth/auth.service';
import { UserServiceImpl } from '@app/user/user.service';
import { JWTTokenHelper } from '@app/helpers/jwt-token-helper';
import { UtilHelperImpl } from './helpers/utils-helper';
import { DBProvider, PrismaDBProvider } from './helpers/db-provider';
import { AuthProviderImpl } from './helpers/auth-provider';

const container = new Container();

container
  .bind<ConfigProvider>(TYPES.ConfigProvider)
  .to(EnvConfigProvider)
  .inSingletonScope();

container
  .bind<UserController>(TYPES.UserController)
  .to(UserControllerImpl)
  .inSingletonScope();

container
  .bind<AuthController>(TYPES.AuthController)
  .to(AuthControllerImpl)
  .inSingletonScope();

container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthServiceImpl)
  .inSingletonScope();

container
  .bind<UserService>(TYPES.UserService)
  .to(UserServiceImpl)
  .inSingletonScope();

container
  .bind<AuthTokenHelper>(TYPES.AuthTokenHelper)
  .to(JWTTokenHelper)
  .inSingletonScope();

container
  .bind<UtilHelper>(TYPES.UtilHelper)
  .to(UtilHelperImpl)
  .inSingletonScope();

container
  .bind<DBProvider>(TYPES.DBProvider)
  .to(PrismaDBProvider)
  .inSingletonScope();

container
  .bind<AuthProvider>(TYPES.AuthProvider)
  .to(AuthProviderImpl)
  .inSingletonScope();

export { container };

container.snapshot();
