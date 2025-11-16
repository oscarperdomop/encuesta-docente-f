import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      nav("/login", { replace: true });
    }
  }, [loading, user, nav]);

  useEffect(() => {
    // ← cierres de sesión en otras pestañas
    const onStorage = (e: StorageEvent) => {
      if (e.key === "__logout__") nav("/login", { replace: true });
    };
    window.addEventListener("storage", onStorage);

    // ← si la página vuelve desde BFCache tras logout, recarga a /login
    const onPageShow = (e: PageTransitionEvent) => {
      if ((e as any).persisted && !localStorage.getItem("token")) {
        location.replace("/login");
      }
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [nav]);

  // loader mientras validamos sesión
  if (loading)
    return <div className="p-6 text-center text-gray-500">Cargando…</div>;
  if (!user) return null;
  return <>{children}</>;
}
