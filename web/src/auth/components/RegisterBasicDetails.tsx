import React from 'react';
import { useRegisterStore } from '../state/register.state';

const RegisterBasicDetails: React.FC = () => {
  const [
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    next,
    canGoNext
  ] = useRegisterStore((s) => [
    s.name,
    s.setName,
    s.email,
    s.setEmail,
    s.password,
    s.setPassword,
    s.next,
    s.canGoNext()
  ]);

  return (
    <>
      <p className="text-sm text-gray-600">Basic Details</p>
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
          onClick={next}
          disabled={!canGoNext}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default RegisterBasicDetails;
