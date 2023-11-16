import axios, { AxiosResponse } from 'axios';
import { Storage } from 'react-jhipster';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { serializeAxiosError } from './reducer.utils';

import { AppThunk } from 'app/config/store';
import { Auth } from '@aws-amplify/auth';
import { parseAttributes } from '../util/helpers/parseAttributes';

const AUTH_TOKEN_KEY = 'jhi-authenticationToken';

export const initialState = {
  loading: false,
  isAuthenticated: false,
  loginSuccess: false,
  loginError: false, // Errors returned from server side
  showModalLogin: false,
  account: {} as any,
  errorMessage: null as unknown as string, // Errors returned from server side
  redirectMessage: null as unknown as string,
  sessionHasBeenFetched: false,
  logoutUrl: null as unknown as string,
};

export type AuthenticationState = Readonly<typeof initialState>;

// Actions

export const getSession = (): AppThunk => (dispatch, getState) => {
  dispatch(getAccount());
};

export const getAccount = createAsyncThunk('authentication/get_account', async () => axios.get<any>('api/account'), {
  serializeError: serializeAxiosError,
});

// export const getAccount = createAsyncThunk(
//   'authentication/get_account',
//   () => {
//     const res: any = { login: 'kodisj@gmail.com', data: { activated: true, authorities: ['ROLE_ADMIN', 'ROLE_USER'] } };
//     return res;
//   },
//   {
//     serializeError: serializeAxiosError,
//   }
// );

interface IAuthParams {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export const authenticate = createAsyncThunk(
  'authentication/login',
  //  async (auth: IAuthParams) => axios.post<any>('api/authenticate', auth),
  async (auth: IAuthParams) => {
    const username = auth.username;
    const password = auth.password;
    const response = await Auth.signIn({ username, password });
    // console.log("Response is ", response);
    // const res:any = {"attributes":response["attributes"]["email"], "data": {"id_token": response["signInUserSession"]["accessToken"]["jwtToken"]}, "status": 200};
    // return res;
    return response;
  }
  // {
  //   serializeError: serializeAxiosError,
  // }
);

export const login: (username: string, password: string, rememberMe?: boolean) => AppThunk =
  (username, password, rememberMe = false) =>
  async dispatch => {
    const result = await dispatch(authenticate({ username, password, rememberMe }));
    // console.log("Result is ", result);
    const user = parseAttributes(result.payload?.attributes);
    const bearerToken = result.payload?.signInUserSession.idToken.jwtToken;

    //  const response = result.payload as AxiosResponse;
    //  const bearerToken = response?.headers?.authorization;
    // if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
    if (bearerToken) {
      // const jwt = bearerToken.slice(7, bearerToken.length);
      const jwt = bearerToken;
      if (rememberMe) {
        Storage.local.set(AUTH_TOKEN_KEY, jwt);
      } else {
        Storage.session.set(AUTH_TOKEN_KEY, jwt);
      }
      dispatch(walletConnected())
    }
    // console.log("User obj " + user);
    console.log('BearerToken ' + bearerToken);
   // dispatch(getSession());
  };

export const clearAuthToken = () => {
  if (Storage.local.get(AUTH_TOKEN_KEY)) {
    Storage.local.remove(AUTH_TOKEN_KEY);
  }
  if (Storage.session.get(AUTH_TOKEN_KEY)) {
    Storage.session.remove(AUTH_TOKEN_KEY);
  }
};

export const logout: () => AppThunk = () => dispatch => {
  clearAuthToken();
  dispatch(logoutSession());
};

export const clearAuthentication = messageKey => dispatch => {
  clearAuthToken();
  dispatch(authError(messageKey));
  dispatch(clearAuth());
};

export const AuthenticationSlice = createSlice({
  name: 'authentication',
  initialState: initialState as AuthenticationState,
  reducers: {
    walletConnected(state) {
      state.isAuthenticated = true;
      state.loginSuccess = true;
      console.log("Setting isAuth = true")
    },
    walletDisconnected(state) {
      state.isAuthenticated = false;
      state.loginSuccess = false;
    },
    logoutSession() {
      return {
        ...initialState,
        showModalLogin: true,
      };
    },
    authError(state, action) {
      return {
        ...state,
        showModalLogin: true,
        redirectMessage: action.payload,
      };
    },
    clearAuth(state) {
      return {
        ...state,
        loading: false,
        showModalLogin: true,
        isAuthenticated: false,
      };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(authenticate.rejected, (state, action) => ({
        ...initialState,
        errorMessage: action.error.message,
        showModalLogin: true,
        loginError: true,
      }))
      .addCase(authenticate.fulfilled, state => ({
        ...state,
        loading: false,
        loginError: false,
        showModalLogin: false,
        loginSuccess: true,
        isAuthenticated:true
      }))
      .addCase(getAccount.rejected, (state, action) => ({
        ...state,
        loading: false,
        isAuthenticated: false,
        sessionHasBeenFetched: true,
        showModalLogin: true,
        errorMessage: action.error.message,
      }))
      .addCase(getAccount.fulfilled, (state, action) => {
        const isAuthenticated = action.payload && action.payload.data && action.payload.data.activated;
        return {
          ...state,
          isAuthenticated,
          loading: false,
          sessionHasBeenFetched: true,
          account: action.payload.data,
        };
      })
      .addCase(authenticate.pending, state => {
        state.loading = true;
      })
      .addCase(getAccount.pending, state => {
        state.loading = true;
      });
  },
});

export const { logoutSession, authError, clearAuth, walletConnected, walletDisconnected } = AuthenticationSlice.actions;

// Reducer
export default AuthenticationSlice.reducer;
