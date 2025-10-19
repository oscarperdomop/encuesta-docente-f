// src/components/USCOConfirm.tsx
import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function USCOConfirm({
  open,
  title = "Confirmar acción",
  description = "¿Deseas continuar?",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-start gap-3">
            {/* Icono de alerta suave */}
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 grid place-items-center">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-lg">{title}</h2>
              <div className="text-gray-600 mt-1">{description}</div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                  onClick={onCancel}
                  autoFocus
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  className="px-5 py-2 rounded-xl bg-usco-primary text-white"
                  onClick={onConfirm}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ayuda para lectores de pantalla */}
        <span className="sr-only">Ventana de confirmación</span>
      </div>
    </div>
  );
}
