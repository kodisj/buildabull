import { createSlice } from '@reduxjs/toolkit';

const wallet = {
  address: '',
  iOS: false,
  authToken: typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') || null : null,
};

const replaceAddress_ = (state: { address: any }, action: { payload: any }) => {
  state.address = action.payload;
};
const replaceAuthToken_ = (state: { authToken: any }, action: { payload: any }) => {
  state.authToken = action.payload;
};
const setIOS_ = (state: { iOS: any }, action: { payload: any }) => {
  state.iOS = action.payload;
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState: wallet,
  reducers: {
    replaceAddress: replaceAddress_,
    replaceAuthToken: replaceAuthToken_,
    setIOS: setIOS_,
  },
});

export const { replaceAddress, setIOS, replaceAuthToken } = walletSlice.actions;

export default walletSlice.reducer;
