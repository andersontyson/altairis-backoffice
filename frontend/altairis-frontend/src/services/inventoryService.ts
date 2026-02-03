import { request } from './apiClient';
import { Inventory, PagedResult } from '@/types';

export const inventoryService = {
    getAvailability: (hotelId: string, fromDate: string, toDate: string, page: number = 1, pageSize: number = 100) => {
        const url = `/inventories?hotelId=${hotelId}&fromDate=${fromDate}&toDate=${toDate}&pageNumber=${page}&pageSize=${pageSize}`;
        return request<PagedResult<Inventory>>(url);
    },

    create: (data: { roomTypeId: string; date: string; totalRooms: number; availableRooms: number }) =>
        request<Inventory>('/inventories', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: { roomTypeId: string; date: string; totalRooms: number; availableRooms: number }) =>
        request<Inventory>(`/inventories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<void>(`/inventories/${id}`, {
            method: 'DELETE',
        }),
};
