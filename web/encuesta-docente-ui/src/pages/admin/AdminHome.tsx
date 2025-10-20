// src/pages/admin/AdminHome.tsx
import USCOHeader from "@/components/USCOHeader";

export default function AdminHome() {
  return (
    <USCOHeader subtitle="Panel de administración" containerClass="max-w-6xl">
      <div className="min-h-[calc(100vh-5rem)]">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido al panel. Aquí irán los accesos a:
          </p>
          <ul className="list-disc ml-6 mt-2 text-gray-700">
            <li>Gestión de encuestas (crear/activar/fechas)</li>
            <li>Asignación de docentes a encuestas</li>
            <li>Monitoreo de intentos (enviados, pendientes, fallidos)</li>
            <li>Usuarios y roles</li>
            <li>Reportes / exportaciones</li>
          </ul>
        </div>
      </div>
    </USCOHeader>
  );
}
