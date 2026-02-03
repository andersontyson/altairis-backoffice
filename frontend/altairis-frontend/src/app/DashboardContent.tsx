'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardSummary, Reservation, HotelDto } from '@/types';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar as BarChartJS } from 'react-chartjs-2';
import { BookOpen, CheckCircle, Clock, XCircle, TrendingUp, DollarSign, Home } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ChartTooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

export default function DashboardContent() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedHotel, setSelectedHotel] = useState<string>('');

    const loadDashboard = async (hotelId?: string) => {
        setLoading(true);
        try {
            const res: DashboardSummary = await dashboardService.getSummary(selectedHotel || undefined);

        } catch (err) {
            console.error('Error cargando el dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const res: DashboardSummary = await dashboardService.getSummary(selectedHotel || undefined);
                setSummary(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [selectedHotel]);


    if (loading) return <div className="py-12 text-center">Cargando Dashboard...</div>;

    // Datos para el chart de reservas
    const reservationsBarData = {
        labels: ['Confirmadas', 'Pendientes', 'Canceladas'],
        datasets: [
            {
                label: 'Reservas',
                data: [
                    summary?.confirmedReservations || 0,
                    summary?.pendingReservations || 0,
                    summary?.cancelledReservations || 0,
                ],
                backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
                borderRadius: 8,
            },
        ],
    };

    // Datos para el chart de ocupación
    const occupancyBarData = {
        labels: summary?.occupancyLast7Days.map(d => new Date(d.date).toLocaleDateString()) || [],
        datasets: [
            {
                label: 'Habitaciones Ocupadas',
                data: summary?.occupancyLast7Days.map(d => d.bookedRooms) || [],
                backgroundColor: '#3b82f6',
                borderRadius: 4,
            },
            {
                label: 'Habitaciones Disponibles',
                data: summary?.occupancyLast7Days.map(d => d.availableRooms) || [],
                backgroundColor: '#22c55e',
                borderRadius: 4,
            },
        ],
    };

    return (
        <div className="space-y-8">
            {/* Header + Filtro de hotel */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
                    <p className="text-gray-500">Bienvenido al MVP Backoffice de Viajes Altairis</p>
                </div>
                <select
                    value={selectedHotel}
                    onChange={e => setSelectedHotel(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">Todos los hoteles</option>
                    {summary?.hotels?.map((h: HotelDto) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Reservas" value={summary?.totalReservations || 0} icon={<BookOpen className="text-blue-600" />} color="bg-blue-50" />
                <StatCard title="Confirmadas" value={summary?.confirmedReservations || 0} icon={<CheckCircle className="text-green-600" />} color="bg-green-50" />
                <StatCard title="Pendientes" value={summary?.pendingReservations || 0} icon={<Clock className="text-yellow-600" />} color="bg-yellow-50" />
                <StatCard title="Canceladas" value={summary?.cancelledReservations || 0} icon={<XCircle className="text-red-600" />} color="bg-red-50" />
                <StatCard title="Habitaciones disponibles hoy" value={summary?.availableRoomsToday || 0} icon={<Home className="text-purple-600" />} color="bg-purple-50" />
                <StatCard title="Ingresos estimados" value={`$${summary?.estimatedRevenue?.toLocaleString() || 0}`} icon={<DollarSign className="text-indigo-600" />} color="bg-indigo-50" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Estado Operativo de Reservas" icon={<TrendingUp size={20} className="text-primary-600" />} chart={<BarChartJS data={reservationsBarData} options={{ responsive: true, maintainAspectRatio: false }} />} />
                <ChartCard title="Ocupación Últimos 7 Días" icon={<TrendingUp size={20} className="text-primary-600" />} chart={<BarChartJS data={occupancyBarData} options={{ responsive: true, maintainAspectRatio: false }} />} />
            </div>

            {/* Últimas Reservas */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6">Últimas Reservas</h3>
                <div className="space-y-4">
                    {summary?.recentReservations?.length ? (
                        summary.recentReservations.map((res: Reservation) => (
                            <ReservationRow key={res.id} reservation={res} />
                        ))
                    ) : (
                        <p className="text-center py-8 text-gray-400 italic">No hay reservas recientes</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Componentes auxiliares
function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

function ChartCard({ title, icon, chart }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                {icon} {title}
            </h3>
            <div className="h-[300px] flex items-center justify-center">{chart}</div>
        </div>
    );
}

function ReservationRow({ reservation }: { reservation: Reservation }) {
    const { guestName, hotelName, status, checkIn } = reservation;
    const statusClasses =
        status === 'Confirmed'
            ? 'bg-green-100 text-green-700'
            : status === 'Pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700';

    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                    {guestName.charAt(0)}
                </div>
                <div>
                    <div className="font-bold text-gray-800 text-sm">{guestName}</div>
                    <div className="text-xs text-gray-500">{hotelName}</div>
                </div>
            </div>
            <div className="text-right">
                <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusClasses}`}>{status}</div>
                <div className="text-[10px] text-gray-400 mt-1">{new Date(checkIn).toLocaleDateString()}</div>
            </div>
        </div>
    );
}
