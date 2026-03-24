import { useEffect, useState } from "react";
import {
  downloadBlob,
  downloadUsersTemplateCSV,
  getAvailableRoles,
  getUsuarios,
  importUsersCSV,
  type UsuarioAdmin,
  type UsersImportResponse,
} from "@/services/admin";

const PER_PAGE = 10;

export default function AdminUsuarios() {
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [replaceRoles, setReplaceRoles] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<UsersImportResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const [users, setUsers] = useState<UsuarioAdmin[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = async (opts: { search?: string; page?: number } = {}) => {
    const search = typeof opts.search === "string" ? opts.search : searchQuery;
    const pageToLoad = typeof opts.page === "number" ? opts.page : page;

    try {
      setUsersLoading(true);
      setUsersError(null);
      const data = await getUsuarios({
        search: search.trim() || undefined,
        page: pageToLoad,
        per_page: PER_PAGE,
      });
      setUsers(Array.isArray(data.items) ? data.items : []);
      setTotalUsers(Number(data.total || 0));
      setTotalPages(Math.max(1, Number(data.pages || 1)));
    } catch (error: any) {
      console.error("[AdminUsuarios] Error loading users:", error);
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
      setUsersError(
        String(error?.response?.data?.detail || "No se pudieron cargar los usuarios.")
      );
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoadingRoles(true);
      try {
        const data = await getAvailableRoles();
        setRoles(data);
      } catch (error) {
        console.error("[AdminUsuarios] Error loading roles:", error);
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers({ search: searchQuery, page });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, page]);

  const onDownloadTemplate = async () => {
    try {
      setImportError(null);
      const blob = await downloadUsersTemplateCSV();
      downloadBlob(blob, "plantilla_usuarios.csv");
    } catch (error) {
      console.error("[AdminUsuarios] Error downloading template:", error);
      setImportError("No se pudo descargar la plantilla CSV de usuarios.");
    }
  };

  const onImport = async (mode: "dry-run" | "import-real") => {
    if (!csvFile) {
      setImportError("Selecciona un archivo CSV antes de continuar.");
      return;
    }

    try {
      setImporting(true);
      setImportError(null);
      setImportResult(null);

      const response = await importUsersCSV(csvFile, {
        dryRun: mode === "dry-run",
        replaceRoles,
      });
      setImportResult(response);

      if (mode === "import-real") {
        setPage(1);
        await loadUsers({ search: searchQuery, page: 1 });
      }
    } catch (error: any) {
      console.error("[AdminUsuarios] Error importing CSV:", error);
      const detail =
        error?.response?.data?.detail ||
        "No se pudo procesar el archivo CSV. Verifica formato, columnas y roles.";
      setImportError(String(detail));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gestion de Usuarios</h1>

      <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Carga masiva CSV</h2>
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Descargar plantilla CSV
          </button>
        </div>

        <div className="text-sm text-gray-700 space-y-1">
          <div>Columnas esperadas: email, nombre, rol, estado</div>
          <div>
            Columnas requeridas: <b>email</b> y <b>rol</b>
          </div>
          <div>Estado valido: activo | inactivo (vacio = activo)</div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-2">Roles disponibles en BD:</div>
          {loadingRoles ? (
            <div className="text-sm text-gray-500">Cargando roles...</div>
          ) : roles.length === 0 ? (
            <div className="text-sm text-amber-700">
              No se pudieron cargar roles o no hay roles disponibles.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <span
                  key={r}
                  className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-700 file:mr-3 file:px-3 file:py-2 file:border-0 file:rounded-lg file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onImport("dry-run")}
              disabled={!csvFile || importing}
              className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Validar CSV
            </button>
            <button
              type="button"
              onClick={() => onImport("import-real")}
              disabled={!csvFile || importing}
              className="px-3 py-2 rounded-lg text-sm bg-usco-primary text-white hover:opacity-95 disabled:opacity-50"
            >
              Importar usuarios
            </button>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={replaceRoles}
            onChange={(e) => setReplaceRoles(e.target.checked)}
            className="h-4 w-4"
          />
          Reemplazar roles existentes del usuario (modo sensible)
        </label>
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
          Si esta opcion esta desactivada, el importador agrega el rol del CSV solo si falta.
        </div>

        {csvFile && (
          <p className="text-sm text-gray-600">
            Archivo seleccionado: <span className="font-medium">{csvFile.name}</span>
          </p>
        )}

        {importError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {importError}
          </div>
        )}

        {importResult && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2 text-sm">
            <div className="font-medium">Resultado de importacion</div>
            <div>
              Insertados: <b>{importResult.summary.inserted}</b> | Actualizados:{" "}
              <b>{importResult.summary.updated}</b> | Omitidos:{" "}
              <b>{importResult.summary.skipped}</b>
            </div>
            <div>
              Roles agregados: <b>{importResult.summary.roles_granted}</b> | Roles ya existentes:{" "}
              <b>{importResult.summary.roles_existing}</b>
            </div>
            {importResult.errors.length > 0 && (
              <div className="text-amber-700">
                {importResult.errors.slice(0, 8).map((e, idx) => (
                  <div key={`${e.row}-${idx}`}>
                    Fila {e.row}: {e.message}
                  </div>
                ))}
                {importResult.errors.length > 8 && (
                  <div>... y {importResult.errors.length - 8} errores mas.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="p-5 border-b space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Usuarios creados</h2>
            <div className="text-xs text-gray-500">Mostrando {PER_PAGE} por pagina</div>
          </div>
          <input
            type="search"
            placeholder="Buscar por email o nombre..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full md:max-w-lg px-4 py-2 border rounded-lg focus:ring-2 focus:ring-usco-primary"
            autoComplete="off"
          />
          {usersError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {usersError}
            </div>
          )}
        </div>

        {usersLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Roles
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Turnos usados
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Creado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      {searchQuery
                        ? "No se encontraron usuarios para ese criterio"
                        : "Aun no hay usuarios para mostrar"}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{u.email}</td>
                      <td className="px-4 py-3 text-sm">{u.nombre || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(u.roles || []).length === 0 ? (
                            <span className="text-sm text-gray-500">-</span>
                          ) : (
                            u.roles.map((r) => (
                              <span
                                key={`${u.id}-${r}`}
                                className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                              >
                                {r}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={[
                            "inline-flex px-2 py-1 text-xs rounded-full",
                            u.estado === "activo"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700",
                          ].join(" ")}
                        >
                          {u.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{u.turnos_usados ?? 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 bg-gray-50 border-t flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <div>
            Total: <b>{totalUsers}</b>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || usersLoading}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Anterior
            </button>
            <span>
              Pagina {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || usersLoading}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

