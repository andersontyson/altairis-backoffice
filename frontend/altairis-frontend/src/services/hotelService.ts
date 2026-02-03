import { request } from './apiClient';
import { Hotel, PagedResult } from '@/types';

export const hotelService = {
  getAll: (search?: string, page: number = 1, pageSize: number = 10) => {
        let url = `/hotels?pageNumber=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request<PagedResult<Hotel>>(url);
  },
    create: (hotel: Partial<Hotel>) => request<Hotel>('/hotels', {
    method: 'POST',
    body: JSON.stringify(hotel),
  }),
  // Backend lacks update/delete for hotels currently, but following requirements
    update: (id: string, hotel: Partial<Hotel>) => request<void>(`/hotels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(hotel),
  }),
    delete: (id: string) => request<void>(`/hotels/${id}`, {
    method: 'DELETE',
  }),
};
