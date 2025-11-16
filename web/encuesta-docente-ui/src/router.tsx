// src/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "@/pages/Login";
import Intro from "@/pages/Intro";
import Justificacion from "@/pages/Justificacion";
import DocentesSelect from "@/pages/DocentesSelect";
import SurveyStep1 from "@/pages/SurveyStep1";
import SurveyStep2 from "@/pages/SurveyStep2";
import ProtectedRoute from "@/routes/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import ResumenTurno from "@/pages/ResumenTurno";

// admin
import AdminRoute from "@/routes/AdminRoute";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminHome from "@/pages/admin/AdminHome";
import EncuestasList from "@/pages/admin/EncuestasList";
import ReportesAvanzados from "@/pages/admin/ReportesAvanzados";
import Docentes from "@/pages/admin/Docentes";
import DocentePerfil from "@/pages/admin/DocentePerfil";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Navigate to="/login" replace /> },

        // Público
        { path: "login", element: <Login /> },

        // Privado (usuario normal)
        {
          path: "intro",
          element: (
            <ProtectedRoute>
              <Intro />
            </ProtectedRoute>
          ),
        },
        {
          path: "justificacion",
          element: (
            <ProtectedRoute>
              <Justificacion />
            </ProtectedRoute>
          ),
        },
        {
          path: "docentes",
          element: (
            <ProtectedRoute>
              <DocentesSelect />
            </ProtectedRoute>
          ),
        },

        // Encuesta
        {
          path: "encuesta/:attemptId/step1",
          element: (
            <ProtectedRoute>
              <SurveyStep1 />
            </ProtectedRoute>
          ),
        },
        {
          path: "encuesta/:attemptId/step2",
          element: (
            <ProtectedRoute>
              <SurveyStep2 />
            </ProtectedRoute>
          ),
        },
        {
          path: "resumen",
          element: (
            <ProtectedRoute>
              <ResumenTurno />
            </ProtectedRoute>
          ),
        },
        {
          path: "encuesta/:attemptId",
          element: <Navigate to="step1" replace />,
        },

        // -------- ADMIN --------
        {
          path: "admin",
          element: (
            <ProtectedRoute>
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            </ProtectedRoute>
          ),
          children: [
            { index: true, element: <AdminHome /> },
            { path: "encuestas", element: <EncuestasList /> },
            { path: "reportes", element: <ReportesAvanzados /> },
            { path: "docentes", element: <Docentes /> },
            { path: "docentes/:teacherId", element: <DocentePerfil /> },

            // rutas futuras:
            // { path: "asignaciones", element: <AdminAsignaciones /> },
            // { path: "usuarios", element: <AdminUsuarios /> },
          ],
        },

        // 404
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);
