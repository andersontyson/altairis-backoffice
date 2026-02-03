'use client';

import { useEffect, useState } from 'react';
import { roomTypeService } from '@/services/roomTypeService';
import { hotelService } from '@/services/hotelService';
import { RoomType, Hotel, PagedResult } from '@/types';
import { Plus, Users, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function RoomTypesPage() {
    const [data, setData] = useState<PagedResult<RoomType> | null>(null);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [selectedHotelId, setSelectedHotelId] = useState<string>('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
    const [formData, setFormData] = useState({
        hotelId: '',
        name: '',
        capacity: 2
    });

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        fetchRoomTypes();
    }, [page, selectedHotelId]);

    const fetchHotels = async () => {
        try {
            const result = await hotelService.getAll('', 1, 100);
            setHotels(result.items);
        } catch (error) {
            console.error('Error fetching hotels:', error);
        }
    };

    const fetchRoomTypes = async () => {
        setLoading(true);
        try {
            const result = await roomTypeService.getAll(selectedHotelId, page);
            setData(result);
        } catch (error) {
            console.error('Error fetching room types:', error);
        } finally {
            setLoading(false);
        }
    };

    // Abrir modal para crear o editar
    const openModal = (roomType?: RoomType) => {
        if (roomType) {
            setEditingRoomType(roomType);
            setFormData({
                hotelId: roomType.hotelId,
                name: roomType.name,
                capacity: roomType.capacity
            });
        } else {
            setEditingRoomType(null);
            setFormData({ hotelId: '', name: '', capacity: 2 });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingRoomType) {
                // Actualizar tipo de habitación
                await roomTypeService.update(editingRoomType.id, formData);
            } else {
                // Crear nuevo tipo de habitación
                await roomTypeService.create(formData);
            }
            setIsModalOpen(false);
            setEditingRoomType(null);
            setFormData({ hotelId: '', name: '', capacity: 2 });
            fetchRoomTypes();
        } catch (error) {
            alert(editingRoomType ? 'Error al actualizar el tipo de habitación' : 'Error al crear el tipo de habitación');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Tipos de Habitación</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
                >
                    <Plus size={20} />
                    Nuevo Tipo
                </button>
            </div>

            {/* Filtro por hotel */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Filtrar por Hotel:</span>
                <select
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 outline-primary-500"
                    value={selectedHotelId}
                    onChange={e => {
                        setSelectedHotelId(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">Todos los hoteles</option>
                    {hotels.map(hotel => (
                        <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                    ))}
                </select>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="text-center py-12">Cargando tipos de habitación...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Hotel</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Capacidad</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.items.map((rt) => (
                                <tr key={rt.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-800">{rt.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{rt.hotelName}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Users size={16} />
                                            {rt.capacity} {rt.capacity === 1 ? 'persona' : 'personas'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">Activo</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className="text-primary-600 hover:underline"
                                            onClick={() => openModal(rt)}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Paginación */}
            {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: data.totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setPage(i + 1)}
                            className={`w-10 h-10 rounded-lg border transition ${page === i + 1
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal Crear/Editar */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRoomType ? 'Editar Tipo de Habitación' : 'Nuevo Tipo de Habitación'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
                        <select
                            required
                            className="w-full border border-gray-300 rounded-lg p-2 outline-primary-500"
                            value={formData.hotelId}
                            onChange={e => setFormData({ ...formData, hotelId: e.target.value })}
                        >
                            <option value="">Seleccione un hotel</option>
                            {hotels.map(hotel => (
                                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Tipo</label>
                        <input
                            required
                            type="text"
                            placeholder="Ej: Suite Deluxe"
                            className="w-full border border-gray-300 rounded-lg p-2 outline-primary-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad Máxima</label>
                        <input
                            required
                            type="number"
                            min="1"
                            className="w-full border border-gray-300 rounded-lg p-2 outline-primary-500"
                            value={formData.capacity}
                            onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            disabled={submitting}
                            type="submit"
                            className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 transition flex justify-center items-center gap-2"
                        >
                            {submitting && <Loader2 className="animate-spin" size={20} />}
                            {submitting ? 'Guardando...' : 'Guardar Tipo'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
