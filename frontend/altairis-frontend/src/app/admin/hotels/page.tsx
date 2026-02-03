'use client';

import { useEffect, useState } from 'react';
import { hotelService } from '@/services/hotelService';
import { Hotel, PagedResult } from '@/types';
import { Plus, Search, MapPin, Globe, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function HotelsPage() {
    // Estados generales
    const [data, setData] = useState<PagedResult<Hotel> | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // Modal y formulario
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        city: '',
        address: ''
    });

    // Cargar hoteles
    useEffect(() => {
        fetchHotels();
    }, [page, search]);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const result = await hotelService.getAll(search, page);
            setData(result);
        } catch (error) {
            console.error('Error fetching hotels:', error);
        } finally {
            setLoading(false);
        }
    };

    // Abrir modal en modo edición
    const handleEdit = (hotel: Hotel) => {
        setEditingHotel(hotel);
        setFormData({
            name: hotel.name,
            country: hotel.country || '',
            city: hotel.city || '',
            address: hotel.address || ''
        });
        setIsModalOpen(true);
    };

    // Eliminar hotel
    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este hotel?')) return;

        try {
            await hotelService.delete(id);
            fetchHotels();
        } catch (error: any) {
            // Si el backend devuelve mensaje en el body
            if (error instanceof Error) {
                alert(error.message);
            } else if (error?.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Error al eliminar el hotel');
            }
        }
    };


    // Guardar hotel (crear o editar)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingHotel) {
                await hotelService.update(editingHotel.id, formData);
                setEditingHotel(null);
            } else {
                await hotelService.create(formData);
            }
            setIsModalOpen(false);
            setFormData({ name: '', country: '', city: '', address: '' });
            fetchHotels();
        } catch (error) {
            alert('Error al guardar el hotel');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Hoteles</h1>
                <button
                    onClick={() => {
                        setEditingHotel(null);
                        setFormData({ name: '', country: '', city: '', address: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
                >
                    <Plus size={20} />
                    Nuevo Hotel
                </button>
            </div>

            {/* Búsqueda */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 border border-gray-100">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, ciudad o país..."
                    className="flex-1 outline-none text-gray-700"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
            </div>

            {/* Hoteles */}
            {loading ? (
                <div className="text-center py-12">Cargando hoteles...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.items.map((hotel) => (
                        <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{hotel.name}</h3>
                                <div className="space-y-2 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        <span>{hotel.address}, {hotel.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} />
                                        <span>{hotel.country}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">Activo</span>
                                    <div className="flex gap-2">
                                        <button
                                            className="text-sm text-primary-600 hover:underline"
                                            onClick={() => handleEdit(hotel)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="text-sm text-red-600 hover:underline"
                                            onClick={() => handleDelete(hotel.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear/Editar */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingHotel ? 'Editar Hotel' : 'Agregar Nuevo Hotel'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2 outline-primary-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                            <input
                                required
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2 outline-primary-500"
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                            <input
                                required
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2 outline-primary-500"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2 outline-primary-500"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            disabled={submitting}
                            type="submit"
                            className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 transition flex justify-center items-center gap-2"
                        >
                            {submitting && <Loader2 className="animate-spin" size={20} />}
                            {submitting ? 'Guardando...' : 'Guardar Hotel'}
                        </button>
                    </div>
                </form>
            </Modal>

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
        </div>
    );
}
