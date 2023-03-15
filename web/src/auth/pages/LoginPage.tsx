import { apiBaseUrl, paths } from '@app/consts';
import { startAuthentication } from '@simplewebauthn/browser';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin() {
    if (!email || !password) return;

    const result = await fetch(`${apiBaseUrl}/auth`, {
      body: JSON.stringify({ email, password }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await result.json();
    if (!result.ok) {
      return toast.error(data.error || 'Login failed. Please try again.');
    }

    if (data.success && data.data.token) {
      toast.success('Login successful!');
      localStorage.setItem('token', data.data.token);
      navigate(`${paths.tfa}${location.search}`);
    } else if (data.success && data.data.twoFactorAuthenticationOptions) {
      try {
        const asseRep = await startAuthentication(
          data.data.twoFactorAuthenticationOptions
        );
        const response = await fetch(`${apiBaseUrl}/auth`, {
          body: JSON.stringify({ email, password, twoFactorAuthData: asseRep }),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `${localStorage.getItem('token')}`
          }
        });

        const responseData = await response.json();

        if (response.ok && responseData.data.token) {
          localStorage.setItem('token', data.data.token);
          navigate(`${paths.tfa}${location.search}`);
        } else {
          toast.error(
            responseData.error ||
              'Two factor authentication failed. Please try again.'
          );
        }
      } catch (err) {
        console.log(err);
        toast.error('Two factor authentication failed. Please try again.');
        return;
      }
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
