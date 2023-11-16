import axios from 'axios';

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { serializeAxiosError } from './reducer.utils';
//import { SessionWallet } from 'algorand-session-wallet';
import { PeraWalletConnect } from '@perawallet/connect';
import { conf } from '../lib/config';

const initialState = {
  ribbonEnv: '',
  inProduction: true,
  isOpenAPIEnabled: false,
  activeConf: 'NoNetwork', // Block chain network
  sessionWallet: null as PeraWalletConnect,
};

export type ApplicationProfileState = Readonly<typeof initialState>;

export const getProfile = createAsyncThunk('applicationProfile/get_profile', async () => axios.get<any>('management/info'), {
  serializeError: serializeAxiosError,
});

export const ApplicationProfileSlice = createSlice({
  name: 'applicationProfile',
  initialState: initialState as ApplicationProfileState,
  reducers: {
    setActiveConf(state, action: PayloadAction<number>) {
      state.activeConf = conf[action.payload].network;
    },
    setSessionWallet(state, action: PayloadAction<PeraWalletConnect>) {
      state.sessionWallet = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(getProfile.fulfilled, (state, action) => {
      const { data } = action.payload;
      state.ribbonEnv = data['display-ribbon-on-profiles'];
      state.inProduction = data.activeProfiles.includes('prod');
      state.isOpenAPIEnabled = data.activeProfiles.includes('api-docs');
    });
  },
});

export const { setActiveConf, setSessionWallet } = ApplicationProfileSlice.actions;

// Reducer
export default ApplicationProfileSlice.reducer;
