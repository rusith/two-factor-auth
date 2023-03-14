import { paths } from '@app/consts';
import React from 'react';
import { Link } from 'react-router-dom';
import RegisterBasicDetails from '../components/RegisterBasicDetails';
import RegisterTwoFactorAuth from '../components/RegisterTwoFactorAuth';
import { useRegisterStore } from '../state/register.state';

const RegisterPage: React.FC = () => {
  const [page] = useRegisterStore((s) => [s.page]);
  console.log(page);

  return (
    <div className="flex h-full justify-center items-center ">
      <div className="w-[20rem] bg-white p-8 rounded h-[28rem] flex flex-col">
        <h1 className="text-2xl font-semibold">Register</h1>

        {page === 1 && <RegisterBasicDetails />}
        {page === 2 && <RegisterTwoFactorAuth />}

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
