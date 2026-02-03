import { request } from './apiClient';
import { RoomType, PagedResult } from '@/types';

export const roomTypeService = {
    getAll: (hotelId?: string, page: number = 1, pageSize: number = 10) => {
        let url = `/roomtypes?pageNumber=${page}&pageSize=${pageSize}`;
        if (hotelId) url += `&hotelId=${hotelId}`;
        return request<PagedResult<RoomType>>(url);
    },

    create: (data: { hotelId: string; name: string; capacity: number }) =>
        request<RoomType>('/roomtypes', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: { hotelId: string; name: string; capacity: number }) =>
        request<void>(`/roomtypes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};
