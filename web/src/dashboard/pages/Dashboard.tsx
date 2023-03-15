import ProtedtedPage from '@app/auth/components/ProtectedPage';
import { paths, tokenKey } from '@app/consts';
import { useApi } from '@app/shared/hooks/useApi';
import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type User = {
  name: string;
  tfaEnabled: boolean;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const api = useApi();
  const [user, setUser] = React.useState<User | null>(null);

  async function getUser() {
    try {
      const result = await api.get<{ data: User }>('/users/me');
      setUser(result.data);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleTwoFactorSwitchClick() {
    if (user?.tfaEnabled) {
      try {
        const result = await api.delete<{ success: boolean; error: string }>(
          '/auth/two-factor-auth',
          {}
        );
        if (result.success) {
          toast.success('Two factor auth successfully removed');
          setUser({ ...user, tfaEnabled: false });
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error('Failed to remove. Please try again.');
      }
    } else {
      navigate(
        `${paths.tfa}?go=${encodeURI(`${location.pathname}${location.search}`)}`
      );
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  function handleLogout() {
    localStorage.removeItem(tokenKey);
    navigate(paths.login);
  }

  return (
    <div className="h-full flex flex-col p-5">
      <p className="font-bold text-2xl">Dashboard</p>
      <p className="text-lg mt-2">Welcome, {user.name}</p>
      <button
        className="mt-3 bg-gray-500 w-fit p-2 pt-1 pb-1 rounded text-white"
        onClick={handleLogout}
      >
        Logout
      </button>
      <div className="bg-white p-5 pt-3 pl-3 rounded mt-3 w-fit">
        <p className="font-bold text-lg">Settings</p>

        <label className="relative inline-flex items-center cursor-pointer mt-2">
          <input
            type="checkbox"
            className="sr-only peer"
            value=""
            checked={user.tfaEnabled}
            onChange={handleTwoFactorSwitchClick}
          />
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
