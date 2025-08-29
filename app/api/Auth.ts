import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { AuthTokens, User } from '../types';

interface LoginRequest { phone: string; password: string; }
interface LoginResponse extends AuthTokens { user: User }

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth as any,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    register: builder.mutation<LoginResponse, { name: string; phone: string; password: string; role?: 'admin' | 'student' }>({
      query: (payload) => ({ url: '/auth/register', method: 'POST', body: payload }),
    }),
    me: builder.query<{ user: User }, void>({
      query: () => ({ url: '/auth/me' }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useMeQuery, useLogoutMutation } = authApi;
