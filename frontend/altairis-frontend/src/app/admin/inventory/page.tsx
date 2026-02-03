'use client';

import { useEffect, useState } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { hotelService } from '@/services/hotelService';
import { roomTypeService } from '@/services/roomTypeService';
import { Inventory, Hotel, PagedResult } from '@/types';
import { Plus, Filter, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { Modal } from '@/components/ui/Modal';

export default function InventoryPage() {
    const [data, setData] = useState<PagedResult<Inventory> | null>(null);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [roomTypes, setRoomTypes] = useState<{ id: string; name: string }[]>([]);
    const [selectedHotelId, setSelectedHotelId] = useState<string>('');
    const [fromDate, setFromDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(addDays(startOfToday(), 30), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

    const [formData, setFormData] = useState({
        roomTypeId: '',
        date: format(startOfToday(), 'yyyy-MM-dd'),
        totalRooms: 1,
        availableRooms: 1
    });

    // -------------------------------
    // FETCH ROOM TYPES al cambiar hotel
    // -------------------------------
    useEffect(() => {
        if (selectedHotelId) fetchRoomTypes(selectedHotelId);
    }, [selectedHotelId]);

    const fetchRoomTypes = async (hotelId: string) => {
        try {
            // Llamada correcta al servicio
            const res = await roomTypeService.getAll(hotelId); // PagedResult<RoomType>

            // Mapear solo id y name para el select
            const types = res.items.map(rt => ({ id: rt.id, name: rt.name }));
            setRoomTypes(types);

            // Seleccionar automáticamente el primer tipo si es un inventario nuevo
            if (!selectedInventory && types.length > 0) {
                setFormData(prev => ({ ...prev, roomTypeId: types[0].id }));
            }
        } catch (error) {
            console.error('Error fetching room types:', error);
        }
    };

    // -------------------------------
    // Abrir modal para crear/editar
    // -------------------------------
    const openModal = (inventory?: Inventory) => {
        if (inventory) {
            setSelectedInventory(inventory);
            setFormData({
                roomTypeId: inventory.roomTypeId,
                date: format(new Date(inventory.date), 'yyyy-MM-dd'),
                totalRooms: inventory.totalRooms,
                availableRooms: inventory.availableRooms
            });
        } else {
            setSelectedInventory(null);
            setFormData({
                roomTypeId: roomTypes.length > 0 ? roomTypes[0].id : '',
                date: format(startOfToday(), 'yyyy-MM-dd'),
                totalRooms: 1,
                availableRooms: 1
            });
        }
        setIsModalOpen(true);
    };

    // -------------------------------
    // Guardar inventario (crear/editar)
    // -------------------------------
    const handleSubmit = async () => {
        try {
            if (!formData.roomTypeId) return alert("Seleccione un tipo de habitación");
            if (formData.availableRooms > formData.totalRooms) return alert("Las habitaciones disponibles no pueden superar el total");

            if (selectedInventory) {
                await inventoryService.update(selectedInventory.id, formData);
            } else {
                await inventoryService.create(formData);
            }

            setIsModalOpen(false);
            fetchInventory();
        } catch (error: any) {
            alert(error?.message || "Error al guardar inventario");
        }
    };

    // -------------------------------
    // Fetch hoteles
    // -------------------------------
    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            const result = await hotelService.getAll('', 1, 100);
            setHotels(result.items);
            if (result.items.length > 0) setSelectedHotelId(result.items[0].id);
        } catch (error) {
            console.error('Error fetching hotels:', error);
        }
    };

    // -------------------------------
    // Fetch inventario
    // -------------------------------
    useEffect(() => {
        if (selectedHotelId) fetchInventory();
    }, [selectedHotelId, fromDate, toDate]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const result = await inventoryService.getAvailability(selectedHotelId, fromDate, toDate);
            setData(result);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------
    // Estado visual
    // -------------------------------
    const getStatusColor = (available: number, total: number) => {
        const ratio = available / total;
        if (ratio === 0) return 'bg-red-100 text-red-700 border-red-200';
        if (ratio < 0.2) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    const getStatusIcon = (available: number, total: number) => {
        const ratio = available / total;
        if (ratio === 0) return <XCircle size={16} />;
        if (ratio < 0.2) return <AlertCircle size={16} />;
        return <CheckCircle size={16} />;
    };

    return (
        <div className="space-y-6">
            {/* Header y Crear Inventario */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Control de Inventario</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
                >
                    <Plus size={20} />
                    Crear Inventario
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hotel</label>
                    <select
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-primary-500"
                        value={selectedHotelId}
                        onChange={e => setSelectedHotelId(e.target.value)}
                    >
                        {hotels.map(hotel => (
                            <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Desde</label>
                    <input
                        type="date"
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 outline-primary-500"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hasta</label>
                    <input
                        type="date"
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 outline-primary-500"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                    />
                </div>
                <button
                    onClick={fetchInventory}
                    className="bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition"
                >
                    <Filter size={20} />
                    Filtrar
                </button>
            </div>

            {/* Tabla de Inventario */}
            {loading ? (
                <div className="text-center py-12">Cargando disponibilidad...</div>
            ) : !selectedHotelId ? (
                <div className="text-center py-12 text-gray-500">Seleccione un hotel para ver el inventario</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tipo Habitación</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Disponibles</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.items.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-800">{format(new Date(inv.date), 'dd/MM/yyyy')}</td>
                                        <td className="px-6 py-4 text-gray-600">{inv.roomTypeName || inv.RoomTypeName}</td>
                                        <td className="px-6 py-4 text-gray-600">{inv.totalRooms}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${inv.availableRooms === 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                                {inv.availableRooms}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${getStatusColor(inv.availableRooms, inv.totalRooms)}`}>
                                                {getStatusIcon(inv.availableRooms, inv.totalRooms)}
                                                {inv.availableRooms === 0 ? 'Agotado' : inv.availableRooms < inv.totalRooms * 0.2 ? 'Baja Disp.' : 'Disponible'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openModal(inv)}
                                                className="text-primary-600 hover:underline font-medium text-sm"
                                            >
                                                Ajustar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {data?.items.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                            No hay datos de inventario para el rango seleccionado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de creación/edición */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedInventory ? 'Editar Inventario' : 'Crear Inventario'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Habitación</label>
                        <select
                            required
                            className="w-full border border-gray-300 rounded-lg p-2"
                            value={formData.roomTypeId}
                            onChange={e => setFormData({ ...formData, roomTypeId: e.target.value })}
                        >
                            <option value="">Seleccione un tipo</option>
                            {roomTypes.map(rt => (
                                <option key={rt.id} value={rt.id}>{rt.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg p-2"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total de Habitaciones</label>
                        <input
                            type="number"
                            min={1}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            value={formData.totalRooms}
                            onChange={e => setFormData({ ...formData, totalRooms: parseInt(e.target.value) })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones Disponibles</label>
                        <input
                            type="number"
                            min={0}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            value={formData.availableRooms}
                            onChange={e => setFormData({ ...formData, availableRooms: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 transition"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
