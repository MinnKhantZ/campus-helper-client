import { fetchBaseQuery, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { BASE_URL } from './BaseUrl';

// We keep this untyped during migration to avoid BaseQueryApi generic friction
const prepareHeaders = (headers: Headers, api: any) => {
  const state = api.getState() as RootState;
  const token = state.auth?.accessToken;
  if (token) headers.set('authorization', `Bearer ${token}`);
  headers.set('content-type', 'application/json');
  return headers;
};

const rawBaseQuery = fetchBaseQuery({ baseUrl: BASE_URL, prepareHeaders });

export const baseQueryWithReauth = async (
  args: string | FetchArgs,
  api: any,
  extraOptions: any
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if ((result as { error?: FetchBaseQueryError })?.error?.status === 401) {
    const refreshToken = (api.getState() as RootState).auth?.refreshToken;
    if (!refreshToken) return result;
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
      api,
      extraOptions
    );
    if ((refreshResult as { data?: any }).data) {
      api.dispatch({ type: 'auth/setTokens', payload: (refreshResult as any).data });
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch({ type: 'auth/clearAuth' });
    }
  }
  return result;
};
