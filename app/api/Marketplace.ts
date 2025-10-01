import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { MarketplaceItem } from '../types';

export interface MarketplaceQuery {
  q?: string;
  category?: string;
  status?: 'available' | 'sold';
  minPrice?: number;
  maxPrice?: number;
  sort?: string; // field:dir
  page?: number;
  limit?: number;
  userId?: number;
}

type Tag = { type: 'Marketplace'; id?: number };

export const marketplaceApi = createApi({
  reducerPath: 'marketplaceApi',
  tagTypes: ['Marketplace'],
  baseQuery: baseQueryWithReauth as unknown as typeof baseQueryWithReauth,
  endpoints: (builder) => ({
    listItems: builder.query<MarketplaceItem[], MarketplaceQuery | void>({
      query: (params) => ({ url: '/marketplace', params: params as unknown as Record<string, string | number | boolean | undefined> }),
      providesTags: ['Marketplace'],
    }),
    getItem: builder.query<MarketplaceItem, number>({
      query: (id) => `/marketplace/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Marketplace', id } as Tag],
    }),
    createItem: builder.mutation<MarketplaceItem, Partial<MarketplaceItem>>({
      query: (body) => ({ url: '/marketplace', method: 'POST', body }),
      invalidatesTags: ['Marketplace'],
    }),
    updateItem: builder.mutation<MarketplaceItem, { id: number; data: Partial<MarketplaceItem> }>({
      query: ({ id, data }) => ({ url: `/marketplace/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Marketplace'],
    }),
    deleteItem: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/marketplace/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Marketplace'],
    }),
  }),
});

export const { useListItemsQuery, useGetItemQuery, useCreateItemMutation, useUpdateItemMutation, useDeleteItemMutation } = marketplaceApi;
