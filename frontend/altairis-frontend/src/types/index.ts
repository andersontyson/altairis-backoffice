// -----------------------------------
// Tipos Base
// -----------------------------------

export interface PagedResult<T> {
    items: T[];
    totalItems: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface Hotel {
    id: string;
    name: string;
    country: string;
    city: string;
    address: string;
    isActive: boolean;
    createdAt: string;
    roomTypes?: RoomType[];
}

export interface RoomType {
    id: string;
    hotelId: string;
    hotelName?: string;
    name: string;
    capacity: number;
    isActive: boolean;
}

export interface Inventory {
    id: string;
    roomTypeId: string;
    RoomTypeName: string;
    roomTypeName?: string;
    hotelName: string;
    date: string;
    totalRooms: number;
    availableRooms: number;
}

export interface Reservation {
    id: string;
    hotelId: string;
    hotelName: string;
    roomTypeId: string;
    roomTypeName: string;
    checkIn: string;
    checkOut: string;
    guestName: string;
    status: 'Pending' | 'Confirmed' | 'Cancelled';
}

// -----------------------------------
// Tipos específicos para Dashboard
// -----------------------------------

export interface OccupancyByDate {
    date: string;
    totalRooms: number;
    bookedRooms: number;
    availableRooms: number;
}

export interface HotelDto {
    id: string;
    name: string;
}

export interface DashboardSummary {
    totalReservations: number;
    confirmedReservations: number;
    pendingReservations: number;
    cancelledReservations: number;
    recentReservations: Reservation[];
    totalRooms: number;
    availableRoomsToday: number;
    occupancyLast7Days: OccupancyByDate[];
    estimatedRevenue: number;
    hotels: HotelDto[];
}
