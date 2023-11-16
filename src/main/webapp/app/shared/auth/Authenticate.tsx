import React from 'react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import draftAuthTx from 'app/helpers/draftAuthTx';
//import { useGetDashboardQuery } from 'app/config/nextApi';
import { replaceAuthToken } from '../reducers/walletSlice';

const Authenticate = () => {
  const wallet = useAppSelector(state => state.wallet);
  // const { refetch } = useGetDashboardQuery(wallet, { skip: !wallet });
  const dispatch = useAppDispatch();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const auth = () => {
    (async () => {
      window.location.href = wallet.iOS ? `algorand-wc://` : `algorand://`;
      setIsAuthenticating(true);
      try {
        const token = await draftAuthTx({ wallet });
        dispatch(replaceAuthToken(token));
        window.localStorage.setItem('authToken', token);
        setIsAuthenticating(false);
      } catch (error) {
        setErrorMsg(error?.message);
      }
      // refetch();
    })();
  };

  return (
    <div>
      <button disabled={!wallet} onClick={auth}>
        Authenticate
      </button>
      {isAuthenticating && (
        <div className="overlay">
          <div className="popup">
            <div className="close" onClick={() => (setIsAuthenticating(false), setErrorMsg(''))}>
              &times;
            </div>
            <div className="content">{errorMsg ? errorMsg : 'Review the auth transaction in your wallet'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authenticate;
