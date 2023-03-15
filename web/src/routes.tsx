import { RouteObject } from 'react-router-dom';
import { paths } from './consts';
import HomePage from '@app/home/pages/HomePage';
import LoginPage from '@app/auth/pages/LoginPage';
import Dashboard from '@app/dashboard/pages/Dashboard';
import RegisterPage from '@app/auth/pages/RegisterPage';
import TwoFactorAuthPage from '@app/auth/pages/TwoFactorAuthPage';

export const routes: RouteObject[] = [
  {
    path: paths.login,
    element: <LoginPage />
  },
  {
    path: paths.register,
    element: <RegisterPage />
  },
  {
    path: paths.dashboard,
    element: <Dashboard />
  },
  {
    path: paths.tfa,
    element: <TwoFactorAuthPage />
  },
  {
    path: '*',
    element: <HomePage />
  }
];
