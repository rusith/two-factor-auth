import ProtedtedPage from '@app/auth/components/ProtectedPage';
import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-5">
      <p className="font-bold text-2xl">Dashboard</p>
      <p className="text-lg mt-2">Welcome, Shanaka</p>
      <div className="bg-white p-5 pt-3 pl-3 rounded mt-3 w-fit">
        <p className="font-bold text-lg">Settings</p>

        <label className="relative inline-flex items-center cursor-pointer mt-2">
          <input type="checkbox" value="" className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium">
            Two Factor Authentication
          </span>
        </label>
      </div>
    </div>
  );
};

export default () => <ProtedtedPage children={<Dashboard />} />;
