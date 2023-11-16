import { createApi, FetchArgs, fetchBaseQuery, retry } from '@reduxjs/toolkit/query';
import { replaceAuthToken } from 'app/shared/reducers/walletSlice';
import { useAppSelector } from 'app/config/store';

const baseUrl = '/api';

const prepareHeaders = (headers, getState) => {
  const wallet = useAppSelector(state => state.wallet);
  const token = wallet.authToken;
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  return headers;
};

const staggeredBaseQuery = retry(
  async (args: string | FetchArgs, nextApi, extraOptions) => {
    const result = await fetchBaseQuery({
      baseUrl,
      prepareHeaders,
    })(args, nextApi, extraOptions);

    //Let's remove the authToken if the response is a 401, the token is either expired or invalid
    if (result.error?.status === 401 && useAppSelector(state => state.wallet).authToken) {
      nextApi.dispatch(replaceAuthToken(null));
      window.localStorage.removeItem('authToken');
    }

    // There is no use retrying when we get these errors
    if ([400, 401, 403, 404, 405, 429].includes(Number(result.error?.status))) {
      retry.fail(result.error);
    }

    return result;
  },
  {
    maxRetries: 3,
  },
);

export const nextApi = createApi({
  reducerPath: 'nextApi',
  baseQuery: staggeredBaseQuery,
  tagTypes: ['Dashboard'],
  endpoints: builder => ({
    // getDashboard: builder.query({
    //   query: wallet => `/dashboard/${wallet}`,
    //   providesTags: ['Dashboard'],
    // }),
  }),
});
