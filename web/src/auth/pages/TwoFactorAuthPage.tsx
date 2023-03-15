import { paths } from '@app/consts';
import { useApi } from '@app/shared/hooks/useApi';
import { startRegistration } from '@simplewebauthn/browser';
import React from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import ProtedtedPage from '../components/ProtectedPage';

const TwoFactorAuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApi();

  function goToNextPage() {
    const search = new URLSearchParams(location.search);
    if (search.has('go')) {
      navigate(decodeURI(search.get('go') || ''));
    } else {
      navigate(paths.dashboard);
    }
  }

  async function handleSetup() {
    try {
      const options = await api.get<{ success: boolean; data: any }>(
        '/auth/two-factor-auth/options'
      );
      if (options.success) {
        let attResp;
        try {
          attResp = await startRegistration(options.data);
        } catch (err: any) {
          if (err.name === 'InvalidStateError') {
            goToNextPage();
            return;
          } else {
            toast.error(
              'Something went wrong while setting up TFA. Try again.'
            );
            return;
          }
        }

        const verifyResult = await api.post<{
          success: boolean;
          error: string;
        }>('/auth/two-factor-auth/verify', attResp);

        if (verifyResult.success) {
          toast.success('Two factor setup successful!');
          goToNextPage();
        } else {
          toast.error(
            verifyResult.error || 'Failed to setup. Please try again.'
          );
        }
      }
    } catch (err: any) {
      toast.error('Failed to setup. Please try again.');
    }
  }

  return (
    <ProtedtedPage>
      <div className="flex h-full justify-center items-center ">
        <div className="w-[20rem] bg-white p-8 rounded h-[28rem] flex flex-col">
          <h1 className="text-2xl font-semibold">Two Factor Auth</h1>

          <p className="text-sm text-gray-600">
            Enable two factor authentication
          </p>

          <img src="/images/fingerprint.svg" className="w-28 m-auto" />

          <div className="flex justify-center mt-auto">
            <button
              className="mt-3 bg-gray-500 w-fit p-2 pt-1 pb-1 rounded text-white"
              onClick={goToNextPage}
            >
              Skip
            </button>
            <button
              className="mt-3 bg-blue-500 w-fit p-2 pt-1 pb-1 rounded text-white disabled:bg-gray-400 ml-2"
              onClick={handleSetup}
            >
              Setup
            </button>
          </div>
        </div>
      </div>
    </ProtedtedPage>
  );
};

export default TwoFactorAuthPage;
