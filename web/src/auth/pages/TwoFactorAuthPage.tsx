import { apiBaseUrl, paths } from '@app/consts';
import { startRegistration } from '@simplewebauthn/browser';
import React from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import ProtedtedPage from '../components/ProtectedPage';

const TwoFactorAuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  function handleSkip() {
    const search = new URLSearchParams(location.search);
    if (search.has('go')) {
      navigate(decodeURI(search.get('go') || ''));
    } else {
      navigate(paths.dashboard);
    }
  }

  function goToNextPage() {
    const search = new URLSearchParams(location.search);
    if (search.has('go')) {
      navigate(decodeURI(search.get('go') || ''));
    } else {
      navigate(paths.dashboard);
    }
  }

  async function handleSetup() {
    console.log(localStorage.getItem('token'));
    let result = await fetch(`${apiBaseUrl}/auth/two-factor-auth/options`, {
      method: 'GET',
      headers: {
        authorization: `${localStorage.getItem('token')}`
      }
    });

    let data = await result.json();

    if (!result.ok || !data.success) {
      return toast.error(
        data.error || 'Failed to setup TFA. Please try again.'
      );
    }

    let attResp;
    try {
      attResp = await startRegistration(data.data);
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        goToNextPage();
        return;
      } else {
        console.log(err);
        toast.error('Something went wrong while setting up TFA. Try again.');
        return;
      }
    }

    result = await fetch(`${apiBaseUrl}/auth/two-factor-auth/verify`, {
      method: 'POST',
      body: JSON.stringify(attResp),
      headers: {
        'Content-Type': 'application/json',
        authorization: `${localStorage.getItem('token')}`
      }
    });

    data = await result.json();

    if (result.ok && data.success && data.data) {
      toast.success('TFA setup successful!');
      goToNextPage();
    } else {
      toast.error(data.error || 'Failed to setup TFA. Please try again.');
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

          <img src="/images/fingerprint.svg" className="w-20" />

          <div className="flex justify-center mt-auto">
            <button
              className="mt-3 bg-gray-500 w-fit p-2 pt-1 pb-1 rounded text-white"
              onClick={handleSkip}
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
