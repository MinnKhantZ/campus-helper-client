import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { ClubMessage } from '../types';

export const messageApi = createApi({
  reducerPath: 'messageApi',
  tagTypes: ['ClubMessages'],
  baseQuery: baseQueryWithReauth as unknown as typeof baseQueryWithReauth,
  endpoints: (builder) => ({
    getClubMessages: builder.query<ClubMessage[], { clubId: number; sinceId?: number; limit?: number }>({
      query: ({ clubId, sinceId, limit }) => {
        const params: string[] = [];
        if (sinceId != null) params.push(`sinceId=${encodeURIComponent(String(sinceId))}`);
        if (limit != null) params.push(`limit=${encodeURIComponent(String(limit))}`);
        const qs = params.length ? `?${params.join('&')}` : '';
        return `/clubs/${clubId}/messages${qs}`;
      },
      providesTags: (_r, _e, { clubId }) => [{ type: 'ClubMessages', id: clubId }],
    }),
    sendClubMessage: builder.mutation<ClubMessage, { clubId: number; content: string }>({
      query: ({ clubId, content }) => ({ url: `/clubs/${clubId}/messages`, method: 'POST', body: { content } }),
      invalidatesTags: (_r, _e, { clubId }) => [{ type: 'ClubMessages', id: clubId }],
    }),
  }),
});

export const { useGetClubMessagesQuery, useSendClubMessageMutation } = messageApi;
