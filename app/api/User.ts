import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { User } from '../types';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth as unknown as typeof baseQueryWithReauth,
  endpoints: (builder) => ({
    usersLookup: builder.query<User[], number[]>({
      query: (ids) => ({ url: `/users/lookup?ids=${ids.join(',')}` }),
    }),
  }),
});

export const { useUsersLookupQuery } = userApi;
