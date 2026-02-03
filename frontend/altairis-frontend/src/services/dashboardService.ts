// src/services/dashboardService.ts
import { DashboardSummary } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
 
console.log('API_URL:', API_URL);


export const dashboardService = {
    getSummary: async (hotelId?: string): Promise<DashboardSummary> => {
        const url = `${API_URL}/dashboard/summary${hotelId ? `?hotelId=${hotelId}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(errorBody || 'Failed to fetch dashboard summary');
        }
        return response.json();
    },
};


