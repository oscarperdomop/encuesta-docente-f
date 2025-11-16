// src/components/USCOHeader.tsx
import { useState, type ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout as defaultLogout, isAdmin } from "@/services/auth";
import { useUser } from "@/contexts/UserContext";
import USCOConfirm from "./USCOConfirm";

type Props = {
  title?: string;
  subtitle?: string;
  containerClass?: string;
  children?: ReactNode;
  /** Si true, muestra el atajo al panel admin cuando el usuario tiene rol admin */
  showAdminShortcut?: boolean;
  /**
   * Callback opcional para cerrar sesión. Si no se pasa, usa logout() por defecto.
   * Útil si la página necesita limpieza adicional antes de salir.
   */
  onLogout?: () => Promise<void> | void;
};

export default function USCOHeader({
  title = "Universidad Surcolombiana",
  subtitle = "Evaluación Docente · Presentación",
  containerClass,
  children,
  onLogout,
  showAdminShortcut = true,
}: Props) {
  const nav = useNavigate();
  const loc = useLocation();
  const { user } = useUser();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  
  const canAdmin = user ? isAdmin(user) : false;

  function openConfirm() {
    setConfirmOpen(true);
  }

  async function doLogout() {
    if (confirmBusy) return;
    setConfirmBusy(true);
    try {
      if (onLogout) {
        await onLogout();
      } else {
        // Cierra turno (best-effort) + limpia sesión + broadcast
        await defaultLogout({ server: false, closeTurno: true });
      }
    } finally {
      setConfirmBusy(false);
      setConfirmOpen(false);
      nav("/login", { replace: true });
    }
  }

  const inAdmin = loc.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-usco-bg">
      <link
        rel="shortcut icon"
        href="https://www.usco.edu.co/imagen-institucional/favicon.ico"
        type="image/x-icon"
      />

      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="w-10 h-10 rounded-full bg-usco-primary text-white grid place-items-center font-bold"
            aria-label="Inicio"
          >
            US
          </Link>

          <div className="min-w-0 flex-1">
            <div className="font-semibold text-base sm:text-lg truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-gray-500 text-sm truncate">{subtitle}</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showAdminShortcut && canAdmin && !inAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
                aria-label="Panel de administración"
                title="Panel de administración"
              >
                Panel admin
              </Link>
            )}

            {inAdmin && (
              <Link
                to="/intro"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50"
                aria-label="Volver a la vista de usuario"
                title="Volver a la vista de usuario"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Volver</span>
              </Link>
            )}

            <button
              type="button"
              onClick={openConfirm}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="text-sm font-medium">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto px-4 md:px-6 py-6 ${containerClass ?? "max-w-5xl"}`}
      >
        {children}
      </main>

      <USCOConfirm
        open={confirmOpen}
        title="¿Finalizar turno?"
        description={
          <>
            Al salir se <b>cerrará tu sesión</b>.
            <br />
            Podrás volver a ingresar si aún dispones de turnos.
          </>
        }
        confirmText={confirmBusy ? "Cerrando…" : "Sí, finalizar"}
        cancelText="Cancelar"
        onConfirm={doLogout}
        onCancel={() => !confirmBusy && setConfirmOpen(false)}
      />
    </div>
  );
}
