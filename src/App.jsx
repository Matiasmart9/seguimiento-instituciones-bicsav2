import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { useAuth } from './hooks/useAuth';
import { useInstitutions } from './hooks/useInstitutions';
import { useAccess } from './hooks/useAccess';
import { useToast } from './context/ToastContext';
import { DEFAULT_FILTERS, filterInstitutions, computeKpis } from './utils/institutionUtils';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import FilterControls from './components/FilterControls';
import InstitutionCard from './components/InstitutionCard';
import Pagination from './components/Pagination';
import AlertPanel from './components/AlertPanel';

// Se cargan bajo demanda para aligerar el bundle inicial
const Login = lazy(() => import('./components/Login'));
const InstitutionModal = lazy(() => import('./components/InstitutionModal'));
const FollowUpModal = lazy(() => import('./components/FollowUpModal'));
const ReportView = lazy(() => import('./components/ReportView'));
const UsersView = lazy(() => import('./components/UsersView'));
const AuditModal = lazy(() => import('./components/AuditModal'));
const KpiDetailModal = lazy(() => import('./components/KpiDetailModal'));

const KPI_CARDS = [
  { key: 'total', title: 'Total', modalTitle: 'Total de Instituciones', color: '#1D4ED8' },
  { key: 'validacionMipymes', title: 'Valid. XML MiPymes', modalTitle: 'Valid. XML MiPymes', color: '#16A34A' },
  { key: 'validacionPremium', title: 'Valid. xml Premium', modalTitle: 'Valid. XML Premium', color: '#059669' },
  { key: 'validacionPremiumPortal', title: 'Valid. Premium/Portal', modalTitle: 'Valid. Premium/Portal-MiPymes', color: '#7C3AED' },
  { key: 'revalidacion', title: 'Revalidación Inst. Activas', modalTitle: 'Revalidación Inst. Activas', color: '#CA8A04' },
  { key: 'activas', title: 'Activas', modalTitle: 'Activas', color: '#10B981' },
  { key: 'suspended', title: 'Suspendidas', modalTitle: 'Suspendidas', color: '#F59E0B' },
  { key: 'expired', title: 'Vencidas', modalTitle: 'Vencidas', color: '#DC2626' },
  { key: 'sinRenovacion', title: 'Sin Renovación', modalTitle: 'Sin Renovación Contrato', color: '#6B7280' },
];

const EmptyStateIllustration = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 dark:text-gray-600 mb-6">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
    <circle cx="16" cy="16" r="6" strokeWidth="1.5" className="text-blue-400"></circle>
    <line x1="16" y1="13" x2="16" y2="19" strokeWidth="1.5" className="text-blue-400"></line>
    <line x1="13" y1="16" x2="19" y2="16" strokeWidth="1.5" className="text-blue-400"></line>
  </svg>
);

const Spinner = ({ text }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  </div>
);

// Cuenta sin acceso: pendiente de aprobación o inhabilitada por un administrador
const AccessBlocked = ({ email, pending, onLogout }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {pending ? 'Cuenta pendiente de aprobación' : 'Cuenta inhabilitada'}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-1">{email}</p>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {pending
          ? 'Un administrador debe habilitar tu acceso. Cuando lo haga, esta pantalla se actualizará sola.'
          : 'Un administrador inhabilitó tu acceso al sistema. Comunícate con él si crees que es un error.'}
      </p>
      <button onClick={onLogout} className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-5 rounded-lg transition-colors">
        Cerrar sesión
      </button>
    </div>
  </div>
);

function App() {
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();
  const { access, profile, loading: accessLoading } = useAccess(user);
  const [view, setView] = useState('panel');
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(12);

  // Cambiar filtros o tamaño de página vuelve a la primera página
  const setFilters = useCallback((update) => {
    setFiltersState(update);
    setCurrentPage(1);
  }, []);
  const setItemsPerPage = (size) => {
    setItemsPerPageState(size);
    setCurrentPage(1);
  };
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [kpiModalData, setKpiModalData] = useState({ isOpen: false, title: '', institutions: [] });

  const { institutions, loading: institutionsLoading, addInstitution, updateInstitution, deleteInstitution, addComment, deleteComment } = useInstitutions(access.active);

  const filteredInstitutions = useMemo(() => filterInstitutions(institutions, filters), [institutions, filters]);
  const kpiData = useMemo(() => computeKpis(institutions), [institutions]);

  const totalPages = Math.max(1, Math.ceil(filteredInstitutions.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const currentInstitutions = filteredInstitutions.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión. Por favor, intenta nuevamente.');
    }
  };

  const handleOpenAddModal = () => {
    setSelectedInstitution(null);
    setIsInstitutionModalOpen(true);
  };

  const handleOpenEditModal = (institution) => {
    setSelectedInstitution(institution);
    setIsInstitutionModalOpen(true);
  };

  const handleDeleteInstitution = async (institutionId) => {
    try {
      await deleteInstitution(institutionId);
      toast.success('Institución eliminada');
    } catch (error) {
      console.error('Error eliminando institución:', error);
      toast.error('Error al eliminar la institución. Por favor, intenta nuevamente.');
    }
  };

  const handleOpenAuditModal = (institution) => {
    setSelectedInstitution(institution);
    setIsAuditModalOpen(true);
  };

  const handleOpenFollowUpModal = (institution) => {
    setSelectedInstitution(institution);
    setIsFollowUpModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsInstitutionModalOpen(false);
    setIsFollowUpModalOpen(false);
    setIsAuditModalOpen(false);
    setSelectedInstitution(null);
  };

  const handleKpiClick = (title, instList) => {
    setKpiModalData({ isOpen: true, title, institutions: instList });
  };

  const closeKpiModal = () => {
    setKpiModalData((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveInstitution = async (institutionData) => {
    try {
      if (institutionData.id) {
        await updateInstitution(institutionData.id, institutionData);
      } else {
        await addInstitution(institutionData);
      }
      handleCloseModals();
      toast.success('Institución guardada');
    } catch (error) {
      console.error('Error al guardar institución:', error);
      toast.error('Error al guardar la institución. Por favor, intenta nuevamente.');
    }
  };

  // Los errores se propagan a FollowUpModal, que los muestra y conserva el texto escrito
  const handleAddComment = (institutionId, commentText) => addComment(institutionId, commentText);
  const handleDeleteComment = (institutionId, comment) => deleteComment(institutionId, comment);

  // Versión en vivo de la institución abierta: el modal refleja comentarios nuevos o eliminados
  const liveSelectedInstitution = selectedInstitution
    ? institutions.find((i) => i.id === selectedInstitution.id) ?? selectedInstitution
    : null;

  if (authLoading) return <Spinner text="Verificando autenticación..." />;

  if (!user) {
    return (
      <Suspense fallback={<Spinner text="Cargando..." />}>
        <Login />
      </Suspense>
    );
  }

  if (accessLoading) return <Spinner text="Verificando permisos..." />;

  if (!access.active) {
    return <AccessBlocked email={user.email} pending={access.pending} onLogout={handleLogout} />;
  }

  if (institutionsLoading) return <Spinner text="Cargando instituciones..." />;

  // Vista efectiva: sin acceso al panel XML, el Reporte es la vista por defecto
  let currentView = view;
  if (currentView === 'users' && !access.isAdmin) currentView = 'report';
  if (currentView === 'panel' && !access.can.xml) currentView = 'report';

  if (currentView === 'users') {
    return (
      <Suspense fallback={<Spinner text="Cargando usuarios..." />}>
        <UsersView currentUser={user} onBack={() => setView('panel')} />
      </Suspense>
    );
  }

  if (currentView === 'report') {
    return (
      <Suspense fallback={<Spinner text="Cargando reporte..." />}>
        <ReportView
          institutions={institutions}
          onBack={access.can.xml ? () => setView('panel') : undefined}
          onLogout={access.can.xml ? undefined : handleLogout}
          userName={profile?.nombre || user.email}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header
        onAddInstitution={handleOpenAddModal}
        onLogout={handleLogout}
        onOpenReport={() => setView('report')}
        onOpenUsers={access.isAdmin ? () => setView('users') : undefined}
        canAdd={access.can.editar}
        institutions={institutions}
      />
      <main className="container mx-auto p-6">
        <div className="flex flex-wrap justify-center gap-3 mb-8 px-2">
          {KPI_CARDS.map(({ key, title, modalTitle, color }) => (
            <KpiCard
              key={key}
              title={title}
              value={kpiData[key].length}
              color={color}
              onClick={() => handleKpiClick(modalTitle, kpiData[key])}
            />
          ))}
        </div>

        <AlertPanel institutions={institutions} />

        <FilterControls filters={filters} setFilters={setFilters} totalCount={filteredInstitutions.length} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentInstitutions.length > 0 ? (
            currentInstitutions.map((inst) => (
              <InstitutionCard
                key={inst.id}
                institution={inst}
                onEdit={handleOpenEditModal}
                onFollowUp={handleOpenFollowUpModal}
                onAudit={handleOpenAuditModal}
                onDelete={handleDeleteInstitution}
                can={access.can}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 border-dashed">
              <EmptyStateIllustration />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No se encontraron instituciones</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
                Prueba ajustando los filtros de búsqueda{access.can.editar ? ', o agrega una nueva institución para empezar a hacer seguimiento' : ''}.
              </p>
              {access.can.editar && <button
                onClick={handleOpenAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar Institución
              </button>}
            </div>
          )}
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredInstitutions.length}
          pageSize={itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={setItemsPerPage}
        />
      </main>

      <Suspense fallback={null}>
        {isInstitutionModalOpen && (
          <InstitutionModal
            key={selectedInstitution?.id ?? 'new'}
            isOpen={isInstitutionModalOpen}
            onClose={handleCloseModals}
            onSave={handleSaveInstitution}
            institution={selectedInstitution}
          />
        )}

        {liveSelectedInstitution && isAuditModalOpen && (
          <AuditModal isOpen={isAuditModalOpen} onClose={handleCloseModals} institution={liveSelectedInstitution} />
        )}

        {selectedInstitution && isFollowUpModalOpen && (
          <FollowUpModal
            isOpen={isFollowUpModalOpen}
            onClose={handleCloseModals}
            institution={liveSelectedInstitution}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        )}

        {kpiModalData.isOpen && (
          <KpiDetailModal
            isOpen={kpiModalData.isOpen}
            onClose={closeKpiModal}
            title={kpiModalData.title}
            institutions={kpiModalData.institutions}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
