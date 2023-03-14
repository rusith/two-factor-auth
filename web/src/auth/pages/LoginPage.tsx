import { paths } from '@app/consts';
import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
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
          />
        </div>

        <div className="flex justify-center mt-2">
          <button className="mt-3 bg-blue-500 w-fit p-2 pt-1 pb-1 rounded text-white">
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
