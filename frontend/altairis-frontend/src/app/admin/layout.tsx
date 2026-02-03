import Link from 'next/link';
import { LayoutDashboard, Hotel, BedDouble, CalendarRange, BookOpen } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 text-primary-400">
          Altairis Backoffice
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-2">
          <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link href="/admin/hotels" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
            <Hotel size={20} />
            Hoteles
          </Link>
          <Link href="/admin/roomtypes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
            <BedDouble size={20} />
            Tipos de Habitación
          </Link>
          <Link href="/admin/inventory" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
            <CalendarRange size={20} />
            Inventario
          </Link>
          <Link href="/admin/reservations" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
            <BookOpen size={20} />
            Reservas
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          v1.0.0 Demo Ready
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
