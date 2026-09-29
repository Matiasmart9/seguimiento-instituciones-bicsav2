import { useState, useRef, useEffect } from 'react';
import { APP_VERSION } from '../version';
import { exportAllToExcel } from '../utils/exportExcel';
import { useToast } from '../context/ToastContext';
import ThemeToggle from './ThemeToggle';
import WeatherWidget from './WeatherWidget';
import ConfirmationModal from './ConfirmationModal';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ExcelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);
const ReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

// canAdd: puede agregar instituciones · onOpenUsers: solo se pasa a los administradores
const Header = ({ onAddInstitution, onLogout, onOpenReport, onOpenUsers, canAdd = true, institutions }) => {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);

  const exportToExcel = async () => {
    setExporting(true);
    try {
      await exportAllToExcel(institutions);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      toast.error('Error al generar el archivo Excel. Por favor, intenta nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const menuRef = useRef(null);

  // Cierra el menú al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
    <header className="bg-gradient-to-r from-[#fa8b31] via-[#f59e0b] to-[#ea580c] dark:from-gray-900 dark:via-orange-900 dark:to-gray-900 shadow-lg px-5 py-4 mb-6 relative z-30">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>

      {/* En pantallas angostas los bloques se apilan y el título nunca se superpone con el clima */}
      <div className="relative flex flex-col gap-3">
        <h1 className="text-center text-2xl md:text-3xl font-bold text-white drop-shadow-md tracking-tight text-balance">
          Seguimiento XML Instituciones BICSA
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="shrink-0">
            <WeatherWidget />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
            <ThemeToggle />
            {canAdd && (
              <button
                onClick={onAddInstitution}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-transform duration-200 hover:scale-105"
              >
                <PlusIcon />
                <span>Agregar Institución</span>
              </button>
            )}
            <button
              onClick={exportToExcel}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-transform duration-200 hover:scale-105"
            >
              <ExcelIcon />
              <span>{exporting ? 'Exportando...' : 'Exportar Excel'}</span>
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <MenuIcon />
                <span>Menú</span>
                <ChevronIcon open={menuOpen} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
                >
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenReport();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors border-b border-gray-100 dark:border-gray-700"
                  >
                    <ReportIcon />
                    Reporte Instituciones
                  </button>
                  {onOpenUsers && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenUsers();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors border-b border-gray-100 dark:border-gray-700"
                    >
                      <UsersIcon />
                      Usuarios
                    </button>
                  )}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmLogout(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <LogoutIcon />
                    Cerrar Sesión
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    {APP_VERSION}
                  </div>
                </div>
              )}
          </div>
          </div>
        </div>
      </div>
    </header>

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
    </>
  );
};
export default Header;
