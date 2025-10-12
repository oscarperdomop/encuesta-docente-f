// src/components/USCOHeader.tsx
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  /** Título grande del header (opcional) */
  title?: string;
  /** Subtítulo bajo el título (opcional) */
  subtitle?: string;
  /** Clase para el contenedor principal del <main> (por defecto max-w-5xl) */
  containerClass?: string;
  /** Contenido de la página debajo del header */
  children?: ReactNode;
};

export default function USCOHeader({
  title = "Universidad Surcolombiana",
  subtitle = "Encuesta Docente · Presentación",
  containerClass,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-usco-bg">
      {/* Favicon (también puedes moverlo a index.html) */}
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
          <div className="min-w-0">
            <div className="font-semibold text-base sm:text-lg truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-gray-500 text-sm truncate">{subtitle}</div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido de la página */}
      <main
        className={`mx-auto px-4 md:px-6 py-6 ${containerClass ?? "max-w-5xl"}`}
      >
        {children}
      </main>

      <p className="text-center text-gray-500 mt-6 text-sm">
        © USCO — Prototipo para demostración
      </p>
    </div>
  );
}
