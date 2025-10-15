// src/components/ConfirmDialog.tsx
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Confirmar acción",
  message = "¿Deseas continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // foco accesible al abrir
      cancelRef.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, onCancel]);

  if (!open) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header con color institucional */}
        <div className="rounded-t-2xl bg-usco-primary text-white px-5 py-3">
          <h2 id="confirm-title" className="text-lg font-semibold">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-5 py-4 text-gray-700">
          <p>{message}</p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded-xl bg-usco-primary text-white hover:opacity-90"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  // Portal para garantizar superposición
  return createPortal(dialog, document.body);
}
