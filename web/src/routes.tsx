import { RouteObject } from 'react-router-dom';
import { paths } from './consts';
import HomePage from '@app/home/pages/HomePage';
import LoginPage from '@app/auth/pages/LoginPage';
import Dashboard from './dashboard/pages/Dashboard';
import RegisterPage from './auth/pages/RegisterPage';

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
    path: '*',
    element: <HomePage />
  }
];
