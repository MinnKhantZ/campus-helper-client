import { fetchBaseQuery, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { BASE_URL } from './BaseUrl';
import { setTokens, clearAuth } from '../features/authSlice';

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

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
    if (!refreshToken) {
      api.dispatch(clearAuth());
      return result;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResult = await rawBaseQuery(
          { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
          api,
          extraOptions
        );
        if ((refreshResult as { data?: any }).data) {
          api.dispatch(setTokens((refreshResult as any).data));
          pendingRequests.forEach((cb) => cb());
        } else {
          api.dispatch(clearAuth());
          pendingRequests.forEach((cb) => cb());
        }
      } finally {
        pendingRequests = [];
        isRefreshing = false;
      }
    } else {
      await new Promise<void>((resolve) => {
        pendingRequests.push(resolve);
      });
    }

    result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};
