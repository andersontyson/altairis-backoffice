'use client';

import { useEffect, useState } from 'react';
import { reservationService } from '@/services/reservationService';
import { hotelService } from '@/services/hotelService';
import { Reservation, Hotel, PagedResult } from '@/types';
import { Plus, Search, Calendar, User, Tag, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { ReservationWizard } from '@/components/ReservationWizard';

export default function ReservationsPage() {
  const [data, setData] = useState<PagedResult<Reservation> | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filters, setFilters] = useState({
    hotelId: '',
    status: '',
    fromDate: '',
    toDate: ''
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [page, filters]);

  const fetchHotels = async () => {
    try {
      const result = await hotelService.getAll('', 1, 100);
      setHotels(result.items);
    } catch (error) {}
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const result = await reservationService.getAll(filters, page);
      setData(result);
    } catch (error) {}
    finally { setLoading(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed': return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle2 size={14}/> Confirmada</span>;
      case 'Cancelled': return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold"><XCircle size={14}/> Cancelada</span>;
      default: return <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold"><Clock size={14}/> Pendiente</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Reservas</h1>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition shadow-lg shadow-primary-200"
        >
          <Plus size={20} />
          Nueva Reserva
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hotel</label>
          <select
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-primary-500"
            value={filters.hotelId}
            onChange={e => setFilters({...filters, hotelId: e.target.value})}
          >
            <option value="">Todos</option>
            {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
          <select
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-primary-500"
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Cualquiera</option>
            <option value="Confirmed">Confirmada</option>
            <option value="Pending">Pendiente</option>
            <option value="Cancelled">Cancelada</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Desde</label>
          <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})}/>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hasta</label>
          <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})}/>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando reservas...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Huésped</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Hotel / Habitación</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fechas</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.items.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                        {res.guestName.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{res.guestName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="font-semibold text-gray-800">{res.hotelName}</div>
                    <div>{res.roomTypeName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1"><Calendar size={14}/> {format(new Date(res.checkIn), 'dd MMM')} - {format(new Date(res.checkOut), 'dd MMM yyyy')}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(res.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary-600 hover:underline font-medium text-sm">Detalles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <ReservationWizard
               onClose={() => setIsWizardOpen(false)}
               onSuccess={() => { setIsWizardOpen(false); fetchReservations(); }}
               hotels={hotels}
             />
           </div>
        </div>
      )}
    </div>
  );
}
