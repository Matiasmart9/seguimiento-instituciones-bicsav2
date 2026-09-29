import { useMemo, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import RichText from './RichText';
import ConfirmationModal from './ConfirmationModal';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { REPORT_GROUPS, buildReport, describeDays, getLastComment, daysSince } from '../utils/report';
import { exportReportToExcel } from '../utils/exportExcel';

const Icon = ({ children, size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const BackIcon = () => <Icon><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>;
const PrintIcon = () => <Icon><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></Icon>;
const ExcelIcon = () => <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></Icon>;
const SearchIcon = () => <Icon size={16}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>;

const LEVEL_STYLES = {
  expired: 'text-red-600 dark:text-red-400 font-bold',
  critical: 'text-orange-600 dark:text-orange-400 font-bold',
  warning: 'text-yellow-600 dark:text-yellow-400 font-semibold',
  ok: 'text-gray-700 dark:text-gray-300',
};

const formatDate = (d) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('es-PY') : 'N/A');

const idleText = (isoDate) => {
  const days = daysSince(isoDate);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'hace 1 día';
  return `hace ${days} días`;
};

const LogoutIcon = () => <Icon size={16}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>;

// onBack: solo si el usuario puede volver al panel · onLogout: para quienes solo ven el reporte
const ReportView = ({ institutions, onBack, onLogout, userEmail }) => {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const toast = useToast();
  const [group, setGroup] = useState('todos');
  const [searchText, setSearchText] = useState('');
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [exporting, setExporting] = useState(false);
  const search = useDebounce(searchText, 250);

  // Totales sin filtrar, para las tarjetas de arriba
  const totals = useMemo(() => buildReport(institutions), [institutions]);
  const groups = useMemo(() => buildReport(institutions, { group, search, onlyOverdue }), [institutions, group, search, onlyOverdue]);

  const grandTotal = totals.reduce((sum, g) => sum + g.items.length, 0);
  const shown = groups.reduce((sum, g) => sum + g.items.length, 0);
  const today = new Date().toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReportToExcel(groups.filter((g) => g.items.length > 0));
    } catch (error) {
      console.error('Error al exportar el reporte:', error);
      toast.error('Error al generar el archivo Excel. Por favor, intenta nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const chipClass = (active) =>
    `px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-orange-500 border-orange-500 text-white shadow'
        : 'border-orange-400 text-orange-600 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 print:bg-white">
      <header className="bg-gradient-to-r from-[#fa8b31] via-[#f59e0b] to-[#ea580c] dark:from-gray-900 dark:via-orange-900 dark:to-gray-900 shadow-lg px-5 py-5 text-white [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            {onBack ? (
              <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors">
                <BackIcon /> Volver al panel
              </button>
            ) : (
              <span className="text-sm text-white/90">{userEmail}</span>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle />
              <button onClick={handleExport} disabled={exporting || shown === 0} className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors">
                <ExcelIcon /> {exporting ? 'Exportando...' : 'Exportar Excel'}
              </button>
              <button onClick={() => window.print()} className="bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors">
                <PrintIcon /> Imprimir
              </button>
              {onLogout && (
                <button onClick={() => setConfirmLogout(true)} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors">
                  <LogoutIcon /> Cerrar sesión
                </button>
              )}
            </div>
          </div>
          <div className="text-center mt-4 print:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow-md tracking-tight text-balance">Reporte de Instituciones XML BICSA</h1>
            <p className="mt-1 text-white/95">Últimos comentarios por institución · Actualizado al {today}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6">
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-blue-600 px-5 py-3 text-center min-w-[9rem]">
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Total</div>
            <div className="text-3xl font-bold text-blue-600">{grandTotal}</div>
          </div>
          {totals.map((g) => (
            <button
              key={g.key}
              onClick={() => setGroup(group === g.key ? 'todos' : g.key)}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 px-5 py-3 text-center min-w-[9rem] transition-transform hover:-translate-y-0.5 ${group === g.key ? 'ring-2 ring-orange-400' : ''}`}
              style={{ borderLeftColor: g.color }}
              title="Clic para filtrar por este grupo"
            >
              <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{g.title}</div>
              <div className="text-3xl font-bold" style={{ color: g.color }}>{g.items.length}</div>
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 space-y-4 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[14rem] max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500"><SearchIcon /></span>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por institución o comentario..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input type="checkbox" checked={onlyOverdue} onChange={(e) => setOnlyOverdue(e.target.checked)} className="w-4 h-4 accent-red-600" />
              Solo vencidas
            </label>
            <span className="ml-auto text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg">
              Resultados: {shown}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={chipClass(group === 'todos')} onClick={() => setGroup('todos')}>Todos</button>
            {REPORT_GROUPS.map((g) => (
              <button key={g.key} className={chipClass(group === g.key)} onClick={() => setGroup(g.key)}>{g.title}</button>
            ))}
          </div>
        </div>

        {shown === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">No hay instituciones para mostrar</h3>
            <p className="text-gray-500 dark:text-gray-400">Prueba cambiando los filtros o la búsqueda.</p>
          </div>
        ) : (
          groups.filter((g) => g.items.length > 0).map((g) => (
            <section key={g.key} className="mb-8 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm break-inside-avoid-page">
              <div className="flex items-center justify-between px-5 py-3 text-white font-semibold text-lg [print-color-adjust:exact] [-webkit-print-color-adjust:exact]" style={{ backgroundColor: g.color }}>
                {g.title}
                <span className="bg-white/25 px-3 py-0.5 rounded-full text-sm">{g.items.length} institucion{g.items.length !== 1 ? 'es' : ''}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/40 text-left text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Institución</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">Fechas</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap">Días</th>
                      <th className="px-4 py-3 font-semibold min-w-[15rem]">Último comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((inst) => {
                      const days = describeDays(inst);
                      const last = getLastComment(inst);
                      return (
                        <tr key={inst.id} className="border-t border-gray-100 dark:border-gray-700 align-middle hover:bg-gray-50 dark:hover:bg-gray-700/40">
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white min-w-[9rem] max-w-[14rem]">{inst.nombre}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                            <div><span className="text-xs text-gray-500 dark:text-gray-400">Ingreso:</span> {formatDate(inst.fechaIngreso)}</div>
                            <div><span className="text-xs text-gray-500 dark:text-gray-400">Vence:</span> {formatDate(inst.fechaVencimiento)}</div>
                          </td>
                          <td className={`px-4 py-3 whitespace-nowrap ${days ? LEVEL_STYLES[days.level] : 'text-gray-400'}`}>{days ? days.text : 'N/A'}</td>
                          <td className="px-4 py-3">
                            {last ? (
                              <>
                                <RichText text={last.texto} className="text-gray-700 dark:text-gray-200 leading-snug" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Por {last.autor} · {new Date(last.fecha).toLocaleString('es-PY')} · <span className="font-medium">{idleText(last.fecha)}</span>
                                  {inst.comentarios.length > 1 && <> · {inst.comentarios.length} comentarios en total</>}
                                </p>
                              </>
                            ) : (
                              <span className="italic text-gray-400">Sin comentarios</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </main>

      <ConfirmationModal
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          onLogout();
        }}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        confirmText="Cerrar sesión"
        confirmIcon={<LogoutIcon />}
      />
    </div>
  );
};

export default ReportView;
