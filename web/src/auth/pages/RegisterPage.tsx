import { apiBaseUrl, paths } from '@app/consts';
import React from 'react';
import { toast } from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRegisterStore } from '../state/register.state';

const RegisterPage: React.FC = () => {
  const [name, setName, email, setEmail, password, setPassword, isValidEmail] =
    useRegisterStore((s) => [
      s.name,
      s.setName,
      s.email,
      s.setEmail,
      s.password,
      s.setPassword,
      s.isValidEmail()
    ]);

  const navigate = useNavigate();
  const location = useLocation();

  async function handleRegister() {
    const result = await fetch(`${apiBaseUrl}/users`, {
      body: JSON.stringify({
        name,
        email,
        password
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!result.ok) {
      const data = await result.json();
      return toast.error(data.message || 'Something went wrong');
    }

    toast.success('Account created successfully!');

    navigate(`${paths.login}${location.search}`);
  }

  return (
    <div className="flex h-full justify-center items-center ">
      <div className="w-[20rem] bg-white p-8 rounded h-[28rem] flex flex-col">
        <h1 className="text-2xl font-semibold">Register</h1>

        <p className="text-sm text-gray-600">Create a new account</p>
        <div className="flex flex-col">
          <label className="block mt-3 font-semibold" htmlFor="name">
            Name
          </label>
          <input
            className="bg-gray-200 rounded mt-1 h-8 p-1 min-w-[14rem]"
            id="name"
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col mt-2">
          <label className="block mt-3 font-semibold" htmlFor="email">
            Email
          </label>
          <input
            className="bg-gray-200 rounded mt-1 h-8 p-1 min-w-[14rem]"
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!isValidEmail && (
            <p className="text-red-500 text-sm mt-1">
              Not a valid email address
            </p>
          )}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-center mt-2">
          <button
            className="mt-3 bg-blue-500 w-fit p-2 pt-1 pb-1 rounded text-white disabled:bg-gray-400"
            onClick={handleRegister}
            disabled={!name || !email || !password || !isValidEmail}
          >
            Register
          </button>
        </div>

        <p className="text-sm text-center text-gray-700 font-semibold mt-auto">
          Already a User?
          <Link to={paths.login} className="text-blue-500 ml-1 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
