import { paths, tokenKey } from '@app/consts';
import { useApi } from '@app/shared/hooks/useApi';
import { startAuthentication } from '@simplewebauthn/browser';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';

type AuthResult = {
  success: boolean;
  data: { token?: string; twoFactorAuthenticationOptions?: any };
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const api = useApi();

  function handleSuccessfullogin(token: string, twoFactor = false) {
    toast.success('Login successful!');
    localStorage.setItem(tokenKey, token);
    if (twoFactor) {
      navigate(`${paths.tfa}${location.search}`);
    } else {
      const search = new URLSearchParams(location.search);
      if (search.has('go')) {
        navigate(decodeURI(search.get('go') || ''));
      } else {
        navigate(paths.dashboard);
      }
    }
  }

  async function handleLogin() {
    if (!email || !password) return;

    try {
      const result = await api.post<AuthResult>('/auth', { email, password });

      if (result.success && result.data.token) {
        handleSuccessfullogin(result.data.token, true);
        return;
      }

      if (result.success && result.data.twoFactorAuthenticationOptions) {
        const asseRep = await startAuthentication(
          result.data.twoFactorAuthenticationOptions
        );

        const authResult = await api.post<AuthResult>('/auth', {
          email,
          password,
          twoFactorAuthData: asseRep
        });

        if (authResult.success && authResult.data.token) {
          handleSuccessfullogin(authResult.data.token, false);
          return;
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Login failed. Please try again.');
    }
  }

  return (
    <div className="flex h-full justify-center items-center">
      <div className="w-fit bg-white p-8 rounded">
        <h1 className="text-2xl font-semibold">Login</h1>

        <div className="flex flex-col">
          <label className="block mt-3 font-semibold" htmlFor="email">
            Email
          </label>
          <input
            className="bg-gray-200 rounded mt-1 h-8 p-1 min-w-[14rem]"
            id="email"
            type="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        <div className="flex flex-col mt-2">
          <label className="block mt-3 font-semibold" htmlFor="password">
            Password
          </label>
          <input
            className="bg-gray-200 rounded mt-1 h-8 p-1"
            id="password"
            type="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        <div className="flex justify-center mt-2">
          <button
            className="mt-3 bg-blue-500 w-fit p-2 pt-1 pb-1 rounded text-white disabled:bg-gray-400"
            disabled={!email || !password}
            onClick={handleLogin}
          >
            Login
          </button>
        </div>

        <p className="mt-3 text-sm text-center text-gray-700 font-semibold">
          New User?
          <Link to={paths.register} className="text-blue-500 ml-1 underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
