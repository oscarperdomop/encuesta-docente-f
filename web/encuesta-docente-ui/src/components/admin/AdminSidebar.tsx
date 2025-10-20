import { NavLink } from "react-router-dom";

const Item = ({
  to,
  children,
  disabled,
}: {
  to: string;
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  if (disabled) {
    return (
      <div
        className="px-3 py-2 rounded-xl text-gray-400 bg-gray-50 cursor-not-allowed"
        title="Próximamente"
      >
        {children}
      </div>
    );
  }
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-3 py-2 rounded-xl block",
          isActive
            ? "bg-usco-primary text-white"
            : "bg-white hover:bg-gray-50 border",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
};

export default function AdminSidebar() {
  return (
    <nav className="space-y-2">
      <div className="text-xs uppercase text-gray-500 px-1 mb-1">Gestión</div>
      <Item to="/admin/encuestas">Encuestas</Item>
      <Item to="/admin/docentes" disabled>
        Docentes
      </Item>
      <Item to="/admin/asignaciones" disabled>
        Asignaciones
      </Item>

      <div className="text-xs uppercase text-gray-500 px-1 mt-4 mb-1">
        Monitoreo
      </div>
      <Item to="/admin/reportes" disabled>
        Reportes
      </Item>
      <Item to="/admin/usuarios" disabled>
        Usuarios
      </Item>
    </nav>
  );
}
