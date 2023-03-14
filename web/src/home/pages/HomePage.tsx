import { paths } from '@app/consts';
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="h-full flex justify-center items-center flex-col">
      <div className="flex w-fit flex-col justify-center items-center">
        <h1 className="text-5xl font-bold">My Awesome App</h1>
        <Link to={paths.dashboard}>
          <button className="mt-4 bg-blue-500 w-fit p-2 rounded text-white">
            Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
