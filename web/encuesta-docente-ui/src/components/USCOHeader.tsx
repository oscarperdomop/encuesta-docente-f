// src/components/USCOHeader.tsx
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout as defaultLogout } from "@/services/auth";
import USCOConfirm from "./USCOConfirm";

type Props = {
  /** Título grande del header (opcional) */
  title?: string;
  /** Subtítulo bajo el título (opcional) */
  subtitle?: string;
  /** Clase para el contenedor principal del <main> (por defecto max-w-5xl) */
  containerClass?: string;
  /** Contenido de la página debajo del header */
  children?: ReactNode;
  /**
   * Callback opcional para cerrar sesión. Si no se pasa, usa logout() por defecto.
   * Útil si la página necesita limpieza adicional antes de salir.
   */
  onLogout?: () => Promise<void> | void;
};

export default function USCOHeader({
  title = "Universidad Surcolombiana",
  subtitle = "Encuesta Docente · Presentación",
  containerClass,
  children,
  onLogout,
}: Props) {
  const nav = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);

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
        // Cierra turno (si aplica) + borra sesión + broadcast a otras pestañas
        await defaultLogout({ server: false, closeTurno: true });
      }
    } finally {
      setConfirmBusy(false);
      setConfirmOpen(false);
      nav("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-usco-bg">
      {/* Favicon (puedes moverlo a index.html si prefieres) */}
      <link
        rel="shortcut icon"
        href="https://www.usco.edu.co/imagen-institucional/favicon.ico"
        type="image/x-icon"
      />

      {/* Header institucional */}
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

          {/* Botón Salir -> abre modal de confirmación */}
          <button
            type="button"
            onClick={openConfirm}
            className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50"
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
      </header>

      {/* Contenido de la página */}
      <main
        className={`mx-auto px-4 md:px-6 py-6 ${containerClass ?? "max-w-5xl"}`}
      >
        {children}
      </main>

      {/* Modal de confirmación (estilo USCO) */}
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
