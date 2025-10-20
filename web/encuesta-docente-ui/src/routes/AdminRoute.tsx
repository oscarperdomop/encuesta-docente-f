// src/routes/AdminRoute.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { me, isAdmin } from "@/services/auth";

type AdminRouteProps = { children: ReactNode };

export default function AdminRoute({ children }: AdminRouteProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await me();
        if (!alive) return;
        setAllowed(isAdmin(u));
      } catch {
        setAllowed(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (allowed === null) return null; // o un loader
  return allowed ? <>{children}</> : <Navigate to="/login" replace />;
}
