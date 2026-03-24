// src/components/LoginHeader.tsx
import { Link } from "react-router-dom";

type Props = {
  subtitle?: string;
};

export default function LoginHeader({
  subtitle = "Encuesta Docente de la Licenciatura en Matemáticas - Vigencia 2025-2",
}: Props) {
  return (
    <header className="border-b border-usco-primary/15 bg-white">
      <link
        rel="shortcut icon"
        href="https://www.usco.edu.co/imagen-institucional/favicon.ico"
        type="image/x-icon"
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
        <Link
          to="/"
          className="w-10 h-10 rounded-full bg-usco-primary text-white grid place-items-center font-bold"
          aria-label="Inicio"
        >
          US
        </Link>
        <div className="min-w-0">
          <div className="font-semibold text-base sm:text-lg text-usco-primary truncate">
            Universidad Surcolombiana
          </div>
          <div className="text-gray-600 text-sm truncate">{subtitle}</div>
        </div>
      </div>
    </header>
  );
}
