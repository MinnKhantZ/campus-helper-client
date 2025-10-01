import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { AnnouncementItem, ClubItem } from '../types';

export const clubApi = createApi({
  reducerPath: 'clubApi',
  tagTypes: ['Clubs', 'Club', 'Announcements'],
  baseQuery: baseQueryWithReauth as unknown as typeof baseQueryWithReauth,
  endpoints: (builder) => ({
    getAllClubs: builder.query<ClubItem[], void>({
      query: () => '/clubs/',
      providesTags: ['Clubs'],
    }),
    getMyClubs: builder.query<ClubItem[], void>({
      query: () => '/clubs/mine',
      providesTags: ['Clubs'],
    }),
    getClubById: builder.query<ClubItem & { announcements?: AnnouncementItem[] }, number>({
      query: (id) => `/clubs/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Club', id }],
    }),
    createClub: builder.mutation<ClubItem, { name: string; description?: string } | Partial<ClubItem>>({
      query: (body) => ({ url: '/clubs/', method: 'POST', body }),
      invalidatesTags: ['Clubs'],
    }),
    updateClub: builder.mutation<ClubItem, { id: number; payload: Partial<ClubItem> }>({
      query: ({ id, payload }) => ({ url: `/clubs/${id}`, method: 'PUT', body: payload }),
      invalidatesTags: (_r, _e, { id }) => ['Clubs', { type: 'Club' as const, id }],
    }),
    deleteClub: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/clubs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Clubs'],
    }),
    requestJoin: builder.mutation<{ message: string; club: ClubItem }, number>({
      query: (id) => ({ url: `/clubs/${id}/join`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => ['Clubs', { type: 'Club' as const, id }],
    }),
    approveJoin: builder.mutation<{ message: string; club: ClubItem }, { id: number; userId: number }>({
      query: ({ id, userId }) => ({ url: `/clubs/${id}/approve`, method: 'POST', body: { userId } }),
      invalidatesTags: (_r, _e, { id }) => ['Clubs', { type: 'Club' as const, id }],
    }),
    getAnnouncements: builder.query<AnnouncementItem[], number>({
      query: (id) => `/clubs/${id}/announcements`,
      providesTags: (_r, _e, id) => [{ type: 'Announcements', id }],
    }),
    postAnnouncement: builder.mutation<AnnouncementItem, { id: number; content: string }>({
      query: ({ id, content }) => ({ url: `/clubs/${id}/announcements`, method: 'POST', body: { content } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Announcements', id }],
    }),
  }),
});

export const {
  useGetAllClubsQuery,
  useGetMyClubsQuery,
  useGetClubByIdQuery,
  useCreateClubMutation,
  useDeleteClubMutation,
  useUpdateClubMutation,
  useRequestJoinMutation,
  useApproveJoinMutation,
  useGetAnnouncementsQuery,
  usePostAnnouncementMutation,
} = clubApi;
