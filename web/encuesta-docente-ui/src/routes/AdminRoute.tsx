// src/routes/AdminRoute.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { me, isAdmin, MeUser } from "@/services/auth";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const u = await me();
        if (!ok) return;
        setAllowed(isAdmin(u));
      } catch {
        setAllowed(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, []);

  if (allowed === null) return null; // puedes renderizar un mini loader si quieres
  return allowed ? children : <Navigate to="/login" replace />;
}
