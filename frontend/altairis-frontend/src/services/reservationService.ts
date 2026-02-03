import { request } from './apiClient';
import { Reservation, DashboardSummary, PagedResult } from '@/types';

export const reservationService = {
  getAll: (filters: { hotelId?: string; status?: string; fromDate?: string; toDate?: string }, page: number = 1, pageSize: number = 10) => {
        let url = `/reservations?pageNumber=${page}&pageSize=${pageSize}`;
    if (filters.hotelId) url += `&hotelId=${filters.hotelId}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.fromDate) url += `&fromDate=${filters.fromDate}`;
    if (filters.toDate) url += `&toDate=${filters.toDate}`;
    return request<PagedResult<Reservation>>(url);
  },
    getById: (id: string) => request<Reservation>(`/reservations/${id}`),
    getSummary: () => request<DashboardSummary>('/reservations/summary'),
    create: (reservation: any) => request<Reservation>('/reservations', {
    method: 'POST',
    body: JSON.stringify(reservation),
  }),
    updateStatus: (id: string, status: string) => request<void>(`/reservations/${id}?status=${status}`, {
    method: 'PUT',
  }),
    delete: (id: string) => request<void>(`/reservations/${id}`, {
    method: 'DELETE',
  }),
};
