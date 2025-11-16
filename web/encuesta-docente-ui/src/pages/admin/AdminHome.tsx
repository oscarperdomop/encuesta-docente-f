// src/pages/admin/AdminHome.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStatsOverview, type StatsOverview } from "@/services/admin";

export default function AdminHome() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getStatsOverview();
        setStats(data);
      } catch (error) {
        console.error("[AdminHome] Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Estadísticas Generales */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Cargando estadísticas…</div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
                title="Usuarios"
                value={stats.total_usuarios}
                icon="👥"
                color="bg-blue-50 text-blue-700"
              />
          <StatCard
                title="Encuestas"
                value={stats.total_encuestas}
                subtitle={`${stats.encuestas_activas} activas`}
                icon="📋"
                color="bg-green-50 text-green-700"
              />
          <StatCard
                title="Respuestas"
                value={stats.total_respuestas}
                icon="✅"
                color="bg-purple-50 text-purple-700"
              />
          <StatCard
                title="Completitud"
                value={`${stats.tasa_completitud.toFixed(1)}%`}
                icon="📊"
                color="bg-orange-50 text-orange-700"
              />
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
          No se pudieron cargar las estadísticas. Verifica que el backend esté corriendo.
        </div>
      )}

      {/* Accesos Rápidos */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="text-lg font-semibold mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickLink
                to="/admin/encuestas"
                title="Encuestas"
                description="Gestiona encuestas activas e inactivas"
                icon="📋"
              />
          <QuickLink
                to="/admin/reportes"
                title="Reportes"
                description="Consulta y exporta resultados"
                icon="📊"
              />
          <QuickLink
                to="/admin/docentes"
                title="Docentes"
                description="Gestiona la lista de docentes"
                icon="👨‍🏫"
              />
          <QuickLink
                to="/admin/usuarios"
                title="Usuarios"
                description="Administra usuarios del sistema"
                icon="👥"
                disabled
              />
        </div>
      </div>
    </div>
  );
}

/* ========== COMPONENTES AUXILIARES ========== */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        <span className={`text-2xl ${color} rounded-lg p-2`}>{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function QuickLink({
  to,
  title,
  description,
  icon,
  disabled,
}: {
  to: string;
  title: string;
  description: string;
  icon: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="p-4 border rounded-xl bg-gray-50 opacity-60 cursor-not-allowed">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="font-semibold text-gray-400">{title}</div>
            <div className="text-sm text-gray-400">{description}</div>
            <div className="text-xs text-gray-400 mt-1">Próximamente</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={to} className="p-4 border rounded-xl hover:bg-gray-50 hover:border-usco-primary transition">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
    </Link>
  );
}
