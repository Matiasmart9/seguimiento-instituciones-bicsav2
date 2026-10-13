import { useMemo, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { useAccessLogs } from '../hooks/useAccessLogs';
import { useUsers } from '../hooks/useUsers';
import { ACCESS_EVENTS } from '../utils/accessLog';
import { formatDateTime } from '../utils/dateUtils';
import { normalizeText } from '../utils/institutionUtils';
import { exportAccessLogToExcel } from '../utils/exportExcel';

const MAX_LOGS = 300;

const Icon = ({ children, size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const BackIcon = () => <Icon><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>;
const ExcelIcon = () => <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></Icon>;
const SearchIcon = () => <Icon size={16}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>;

const EVENT_STYLES = {
  login: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  logout: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  timeout: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

const RANGES = [
  { value: 'todo', label: 'Todo', days: null },
  { value: 'hoy', label: 'Hoy', days: 0 },
  { value: '7', label: 'Últimos 7 días', days: 7 },
  { value: '30', label: 'Últimos 30 días', days: 30 },
];

const startOfRange = (days) => {
  if (days === null) return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
};

const AccessLogView = ({ onBack }) => {
  const toast = useToast();
  const { logs, loading, error } = useAccessLogs(true, MAX_LOGS);
  const { users } = useUsers(true);
  const [searchText, setSearchText] = useState('');
  const [evento, setEvento] = useState('todos');
  const [range, setRange] = useState('todo');
  const [exporting, setExporting] = useState(false);
  const search = useDebounce(searchText, 250);

  const names = useMemo(() => Object.fromEntries(users.map((u) => [u.uid, u.nombre || ''])), [users]);

  const rows = useMemo(() => {
    const from = startOfRange(RANGES.find((r) => r.value === range).days);
    const query = normalizeText(search);
    return logs
      .map((log) => ({ ...log, nombre: names[log.uid] || '' }))
      .filter((log) => (evento === 'todos' || log.evento === evento) && (!from || log.ts >= from))
      .filter((log) => !query || normalizeText(`${log.nombre} ${log.email} ${log.dispositivo}`).includes(query));
  }, [logs, names, evento, range, search]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAccessLogToExcel(rows);
    } catch (err) {
      console.error('Error al exportar el registro de accesos:', err);
      toast.error('Error al generar el archivo Excel. Por favor, intenta nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const selectClass = 'p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-[#fa8b31] via-[#f59e0b] to-[#ea580c] dark:from-gray-900 dark:via-orange-900 dark:to-gray-900 shadow-lg px-5 py-5 text-white">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors">
              <BackIcon /> Volver al panel
            </button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={handleExport} disabled={exporting || rows.length === 0} className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors">
                <ExcelIcon /> {exporting ? 'Exportando...' : 'Exportar Excel'}
              </button>
            </div>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow-md tracking-tight">Registro de accesos</h1>
            <p className="mt-1 text-white/95">Quién inició o cerró sesión, cuándo y desde qué dispositivo</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6">
        {error ? (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-5">
            <h2 className="font-bold mb-1">No se pudo leer el registro de accesos</h2>
            <p className="text-sm">
              Firestore rechazó la consulta ({error.code || 'error'}). Lo más probable es que las reglas actualizadas todavía no estén publicadas:
              copia el contenido de <code className="font-mono">firestore.rules</code> en Firebase Console → Firestore Database → Reglas y pulsa Publicar.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[14rem] max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500"><SearchIcon /></span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar por usuario, correo o dispositivo..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <select value={evento} onChange={(e) => setEvento(e.target.value)} className={selectClass} aria-label="Filtrar por evento">
                <option value="todos">Todos los eventos</option>
                {Object.entries(ACCESS_EVENTS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select value={range} onChange={(e) => setRange(e.target.value)} className={selectClass} aria-label="Filtrar por fecha">
                {RANGES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <span className="ml-auto text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg">
                Mostrando {rows.length} de {logs.length}
              </span>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-12">Cargando accesos...</p>
            ) : rows.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Sin registros</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {logs.length === 0 ? 'Los accesos se empezarán a registrar desde el próximo inicio de sesión.' : 'Ningún registro coincide con los filtros.'}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/40 text-left text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">Fecha y hora</th>
                      <th className="px-4 py-3 font-semibold">Usuario</th>
                      <th className="px-4 py-3 font-semibold">Evento</th>
                      <th className="px-4 py-3 font-semibold">Dispositivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((log) => (
                      <tr key={log.id} className="border-t border-gray-100 dark:border-gray-700 align-middle hover:bg-gray-50 dark:hover:bg-gray-700/40">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatDateTime(log.ts.toISOString())}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 dark:text-white">{log.nombre || log.email}</div>
                          {log.nombre && <div className="text-xs text-gray-500 dark:text-gray-400">{log.email}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${EVENT_STYLES[log.evento] || EVENT_STYLES.logout}`}>
                            {ACCESS_EVENTS[log.evento] || log.evento}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{log.dispositivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Se muestran los últimos {MAX_LOGS} movimientos. Solo se registran inicios de sesión hechos con correo y contraseña y cierres de sesión; recargar la página con la sesión abierta no genera registro.
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default AccessLogView;
