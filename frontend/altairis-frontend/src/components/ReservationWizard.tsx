'use client';

import { useState, useEffect } from 'react';
import { Hotel, RoomType } from '@/types';
import { roomTypeService } from '@/services/roomTypeService';
import { reservationService } from '@/services/reservationService';
import { X, ChevronRight, ChevronLeft, Calendar, BedDouble, UserCheck, Loader2, CheckCircle } from 'lucide-react';

interface WizardProps {
  onClose: () => void;
  onSuccess: () => void;
  hotels: Hotel[];
}

export function ReservationWizard({ onClose, onSuccess, hotels }: WizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hotelId: '',
    roomTypeId: '',
    checkIn: '',
    checkOut: '',
    guestName: ''
  });
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  useEffect(() => {
    if (formData.hotelId) {
      roomTypeService.getAll(formData.hotelId, 1, 100).then(res => setRoomTypes(res.items));
    }
  }, [formData.hotelId]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await reservationService.create(formData);
      onSuccess();
    } catch (error) {
      alert('Error al crear la reserva. Verifique disponibilidad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-6 border-b flex justify-between items-center bg-primary-600 text-white">
        <div>
          <h2 className="text-xl font-bold">Nueva Reserva</h2>
          <p className="text-primary-100 text-sm">Paso {step} de 3</p>
        </div>
        <button onClick={onClose} className="hover:bg-primary-700 p-2 rounded-full transition"><X size={24}/></button>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold flex items-center gap-2"><Calendar className="text-primary-600"/> Fechas y Destino</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
                <select
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-primary-500 outline-none transition"
                  value={formData.hotelId}
                  onChange={e => setFormData({...formData, hotelId: e.target.value})}
                >
                  <option value="">Seleccione un hotel</option>
                  {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-In</label>
                  <input type="date" className="w-full border-2 border-gray-100 rounded-xl p-3" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out</label>
                  <input type="date" className="w-full border-2 border-gray-100 rounded-xl p-3" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})}/>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold flex items-center gap-2"><BedDouble className="text-primary-600"/> Selección de Habitación</h3>
            <div className="grid grid-cols-1 gap-3">
              {roomTypes.map(rt => (
                <div
                  key={rt.id}
                  onClick={() => setFormData({...formData, roomTypeId: rt.id})}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition ${formData.roomTypeId === rt.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-800">{rt.name}</div>
                      <div className="text-sm text-gray-500">Capacidad: {rt.capacity} personas</div>
                    </div>
                    {formData.roomTypeId === rt.id && <CheckCircle className="text-primary-600"/>}
                  </div>
                </div>
              ))}
              {roomTypes.length === 0 && <p className="text-center py-8 text-gray-500 italic">No hay tipos de habitación disponibles para este hotel.</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold flex items-center gap-2"><UserCheck className="text-primary-600"/> Información del Huésped</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-primary-500 outline-none"
                value={formData.guestName}
                onChange={e => setFormData({...formData, guestName: e.target.value})}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700">
              <p className="font-bold mb-1">Resumen de la reserva:</p>
              <p>Hotel: {hotels.find(h => h.id === formData.hotelId)?.name}</p>
              <p>Habitación: {roomTypes.find(rt => rt.id === formData.roomTypeId)?.name}</p>
              <p>Fechas: {formData.checkIn} al {formData.checkOut}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-gray-50 flex justify-between">
        {step > 1 ? (
          <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-800 transition">
            <ChevronLeft size={20}/> Atrás
          </button>
        ) : <div/>}

        {step < 3 ? (
          <button
            disabled={!formData.hotelId || (step === 2 && !formData.roomTypeId)}
            onClick={handleNext}
            className="bg-primary-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700 transition disabled:opacity-50"
          >
            Siguiente <ChevronRight size={20}/>
          </button>
        ) : (
          <button
            disabled={loading || !formData.guestName}
            onClick={handleSubmit}
            className="bg-primary-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle size={20}/>}
            {loading ? 'Confirmando...' : 'Confirmar Reserva'}
          </button>
        )}
      </div>
    </div>
  );
}
