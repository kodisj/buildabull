import axios from 'axios';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { PermissionResult, SessionWallet, SignedTxn, allowedWallets } from 'algorand-session-wallet';

export const initialState = {
  selectorOpen: false,
  darkMode: false,
  connected: false,
  accts: [],
sessionWallet: null as unknown as any,
  choice: 'NoNetwork',
};

export type AlgorandWalletState = Readonly<typeof initialState>;

// Actions
export const AlgorandWalletSlice = createSlice({
  name: 'algorandWallet',
  initialState: initialState as AlgorandWalletState,
  reducers: {
    reset() {
      return initialState;
    },
    handleSelectedWallet(state, action: PayloadAction<any>) {
      state.choice = action.payload.choice;
      state.selectorOpen = false;
      state.connected = action.payload.connected === undefined ? false: true;
      state.accts = action.payload.accts === undefined ? []: [action.payload.accts];
    },
    disconnectWallet(state) {
      state.selectorOpen = true;
      state.connected = false;
      state.accts = [''];
    },
handleChangeAccount(state, action: PayloadAction<any>) {
      state.sessionWallet.setAccountIndex(parseInt(action.payload.target.value, 10));
      //state.sessionWallet = (state.sessionWallet);
    },
    handleClose(state, action: PayloadAction<any>) {
      // action.payload.stopPropagation();
      state.selectorOpen = false;
    },
    confirmDelete(state, action: PayloadAction<any>) {
      // action.payload.stopPropagation();
      state.selectorOpen = false;
    },
    handleDisplayWalletSelection(state) {
      state.selectorOpen = true;
    },
  },
  // extraReducers(builder) {
  //   builder
  //     .addCase(handleSelectedWallet.pending, state => {
  //       state.loading = true;
  //     })
  //     .addCase(handleSelectedWallet.rejected, (state, action) => ({
  //       ...initialState,
  //       registrationFailure: true,
  //       errorMessage: action.error.message,
  //     }))
  //     .addCase(handleSelectedWallet.fulfilled, () => ({
  //       ...initialState,
  //       registrationSuccess: true,
  //       successMessage: 'Successfully connected to wallet!',
  //     }));
  // },
});

export const {
  reset,
  handleDisplayWalletSelection,
  handleSelectedWallet,
handleChangeAccount,
  handleClose,
  confirmDelete,
  disconnectWallet,
} = AlgorandWalletSlice.actions;

// Reducer
export default AlgorandWalletSlice.reducer;
