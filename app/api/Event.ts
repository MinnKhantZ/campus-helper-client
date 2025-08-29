import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import type { EventItem } from "../types";

export const eventApi = createApi({
  reducerPath: "eventApi",
  tagTypes: ["Events"],
  baseQuery: baseQueryWithReauth as any,
  endpoints: (builder) => ({
    getAllEvents: builder.query<EventItem[], void>({
      query: () => `/events/`,
      providesTags: ["Events"],
    }),
    createEvent: builder.mutation<EventItem, Partial<EventItem>>({
      query: (newEvent) => ({
        url: "/events/",
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    updateEvent: builder.mutation<EventItem, { id: number; updatedEvent: Partial<EventItem> }>({
      query: ({ id, updatedEvent }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body: updatedEvent,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteEvent: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useGetAllEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventApi;
