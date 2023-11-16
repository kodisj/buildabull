import { connector } from 'app/adapters/walletConnect';
import { nextApi } from 'app/config/nextApi';
import { replaceAddress, replaceAuthToken } from './walletSlice';

export const walletListeners = ({ dispatch }) => {
  connector.on('connect', (error, payload) => {
    try {
      if (error) {
        throw error;
      }
      const { accounts } = payload.params[0];
      dispatch(replaceAddress(accounts[0]));
    } catch (err) {
      console.error(err);
    }
  });

  connector.on('disconnect', (error, payload) => {
    try {
      if (error) {
        throw error;
      }
      dispatch(replaceAuthToken(null));
      dispatch(replaceAddress(null));
      dispatch(nextApi.util.resetApiState());
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }
  });

  return next => action => next(action);
};
