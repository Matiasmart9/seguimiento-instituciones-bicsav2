import { useMemo } from 'react';
import { AUDIT_ACTIONS, buildTimeline } from '../utils/audit';
import { formatDateTime } from '../utils/dateUtils';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Icon = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ACTION_ICONS = {
  institucion_creada: <Icon><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>,
  estado_cambiado: <Icon><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></Icon>,
  institucion_editada: <Icon><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></Icon>,
  comentario_agregado: <Icon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon>,
  comentario_eliminado: <Icon><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Icon>,
};

const COLORS = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const AuditModal = ({ isOpen, onClose, institution }) => {
  const timeline = useMemo(() => buildTimeline(institution), [institution]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="h-full flex justify-center items-center p-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-5 sm:p-6 w-full max-w-2xl relative flex flex-col h-full max-h-[48rem]">
          <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <CloseIcon />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold pr-8 text-gray-900 dark:text-white">
            Auditoría de: <span className="text-blue-600 dark:text-blue-400">{institution.nombre}</span>
          </h2>

          <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3 flex items-center justify-between">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">Historial de movimientos</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timeline.length} movimiento{timeline.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2 mt-2">
            {timeline.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">Todavía no hay movimientos registrados.</p>
            ) : (
              <ol className="space-y-2">
                {timeline.map((entry, index) => {
                  const meta = AUDIT_ACTIONS[entry.accion] || { label: entry.accion, color: 'blue' };
                  return (
                    <li key={`${entry.fecha}-${index}`} className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/50 rounded-md p-3">
                      <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${COLORS[meta.color]}`}>
                        {ACTION_ICONS[entry.accion]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">{meta.label}</span>
                          <time className="text-xs text-gray-500 dark:text-gray-400" dateTime={entry.fecha}>
                            {formatDateTime(entry.fecha)}
                          </time>
                        </div>
                        {entry.detalle && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 break-words">{entry.detalle}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Por <strong className="text-gray-700 dark:text-gray-200">{entry.usuario}</strong>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditModal;
