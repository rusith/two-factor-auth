import { Container } from 'inversify';
import 'reflect-metadata';
import { ConfigProvider } from '@app/helpers';
import { EnvConfigProvider } from '@app/helpers/env-config-provider';
import { TYPES } from '@app/types';

const container = new Container();

container
  .bind<ConfigProvider>(TYPES.ConfigProvider)
  .to(EnvConfigProvider)
  .inSingletonScope();

export { container };

container.snapshot();
