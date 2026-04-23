import React, { useState, useMemo, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { useAuth } from './hooks/useAuth';
import { useInstitutions } from './hooks/useInstitutions';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import FilterControls from './components/FilterControls';
import InstitutionCard from './components/InstitutionCard';
import InstitutionModal from './components/InstitutionModal';
import FollowUpModal from './components/FollowUpModal';
import AlertPanel from './components/AlertPanel';
import Login from './components/Login';
import KpiDetailModal from './components/KpiDetailModal';

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

function App() {
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState({ estado: 'Todos', categoria: 'Todos', search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [kpiModalData, setKpiModalData] = useState({ isOpen: false, title: '', institutions: [] });
  
  const { institutions, loading: institutionsLoading, addInstitution, updateInstitution, deleteInstitution, addComment } = useInstitutions();

const filteredInstitutions = useMemo(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return institutions.filter(inst => {
    // ✅ LÓGICA ESPECIAL PARA VENCIDAS
    if (filters.estado === 'Vencidas') {
      if (!inst.fechaVencimiento) return false;
      const dueDate = new Date(inst.fechaVencimiento + 'T00:00:00');
      const isExpired = (inst.estado === 'Validación de XML' || inst.estado === 'Revalidación de XML') && dueDate < today;
      
      const categoriaMatch = filters.categoria === 'Todos' || inst.categoria === filters.categoria;
      const searchMatch = !filters.search || 
        inst.nombre.toLowerCase().includes(filters.search.toLowerCase());
      
      return isExpired && categoriaMatch && searchMatch;
    }
    
    // ✅ LÓGICA NORMAL PARA OTROS ESTADOS
    const estadoMatch = filters.estado === 'Todos' || inst.estado === filters.estado;
    const categoriaMatch = filters.categoria === 'Todos' || inst.categoria === filters.categoria;
    const searchMatch = !filters.search || 
      inst.nombre.toLowerCase().includes(filters.search.toLowerCase());
    
    return estadoMatch && categoriaMatch && searchMatch;
  });
  }, [institutions, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInstitutions = filteredInstitutions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage);

  const kpiData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calcular vencidas primero
    const expired = institutions.filter(i => {
      if (!i.fechaVencimiento) return false;
      const dueDate = new Date(i.fechaVencimiento + 'T00:00:00');
      return (i.estado === 'Validación de XML' || i.estado === 'Revalidación de XML') && dueDate < today;
    });
    
    return {
      total: institutions.filter(i => i.estado !== 'Activo' && i.estado !== 'Suspendida'), // ✅ Sin Activas ni Suspendidas
      validacionMipymes: institutions.filter(i => 
        i.estado === 'Validación de XML' && i.categoria === 'MiPymes'
      ),
      validacionPremium: institutions.filter(i => 
        i.estado === 'Validación de XML' && i.categoria === 'Premium'
      ),
      validacionPremiumPortal: institutions.filter(i => 
        i.estado === 'Validación de XML' && i.categoria === 'Premium/Portal-MiPymes'
      ),
      revalidacion: institutions.filter(i => i.estado === 'Revalidación de XML'),
      activas: institutions.filter(i => i.estado === 'Activo'),
      suspended: institutions.filter(i => i.estado === 'Suspendida'),
      expired: expired, // Vencidas
      sinRenovacion: institutions.filter(i => i.estado === 'Sin Renovación Contrato'),
    };
  }, [institutions]);

  const handleLoginSuccess = () => {
    console.log('✅ Login exitoso - callback ejecutado');
    // El hook useAuth ya maneja la actualización automáticamente
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      await signOut(auth);
      // El hook useAuth actualizará automáticamente el estado
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Por favor, intenta nuevamente.');
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
      console.log('🗑️ Eliminando institución:', institutionId);
      await deleteInstitution(institutionId);
      console.log('✅ Institución eliminada exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando institución:', error);
      alert('Error al eliminar la institución. Por favor, intenta nuevamente.');
    }
  };

  const handleOpenFollowUpModal = (institution) => {
    setSelectedInstitution(institution);
    setIsFollowUpModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsInstitutionModalOpen(false);
    setIsFollowUpModalOpen(false);
    setSelectedInstitution(null);
  };

  const handleKpiClick = (title, instList) => {
    setKpiModalData({ isOpen: true, title, institutions: instList });
  };

  const closeKpiModal = () => {
    setKpiModalData({ ...kpiModalData, isOpen: false });
  };

  const handleSaveInstitution = async (institutionData) => {
    try {
      if (institutionData.id) {
        await updateInstitution(institutionData.id, institutionData);
      } else {
        await addInstitution(institutionData);
      }
      handleCloseModals();
    } catch (error) {
      console.error('Error al guardar institución:', error);
      alert('Error al guardar la institución. Por favor, intenta nuevamente.');
    }
  };

  const handleAddComment = async (institutionId, commentText) => {
    try {
      console.log('🔄 App: Agregando comentario a institución:', institutionId);
      await addComment(institutionId, commentText);
      console.log('✅ App: Comentario agregado exitosamente');
    } catch (error) {
      console.error('❌ App: Error al agregar comentario:', error);
      alert('Error al agregar comentario. Por favor, intenta nuevamente.');
    }
  };

  // Debug: mostrar estado actual
  console.log('🎯 Estado actual - authLoading:', authLoading, 'user:', user ? user.email : 'No user', 'institutionsLoading:', institutionsLoading);

  // Mostrar loading mientras verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Mostrar login si no hay usuario
  if (!user) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // Mostrar loading mientras cargan las instituciones
  if (institutionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando instituciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header onAddInstitution={handleOpenAddModal} onLogout={handleLogout} institutions={institutions} />
      <main className="container mx-auto p-6">
        {/* Dashboard KPIs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 px-2">
            <KpiCard title="Total" value={kpiData.total.length} color="#1D4ED8" icon="🏢" onClick={() => handleKpiClick('Total de Instituciones', kpiData.total)} />
            <KpiCard title="Valid. XML MiPymes" value={kpiData.validacionMipymes.length} color="#16A34A" icon="📊" onClick={() => handleKpiClick('Valid. XML MiPymes', kpiData.validacionMipymes)} />
            <KpiCard title="Valid. xml Premium" value={kpiData.validacionPremium.length} color="#059669" icon="⭐" onClick={() => handleKpiClick('Valid. XML Premium', kpiData.validacionPremium)} />
            <KpiCard title="Valid. Premium/Portal" value={kpiData.validacionPremiumPortal.length} color="#7C3AED" icon="🌐" onClick={() => handleKpiClick('Valid. Premium/Portal-MiPymes', kpiData.validacionPremiumPortal)} /> {/* NUEVO KPI */}
            <KpiCard title="Revalidación Inst. Activas" value={kpiData.revalidacion.length} color="#CA8A04" icon="🔄" onClick={() => handleKpiClick('Revalidación Inst. Activas', kpiData.revalidacion)} />
            <KpiCard title="Activas" value={kpiData.activas.length} color="#10B981" icon="✅" onClick={() => handleKpiClick('Activas', kpiData.activas)} />
            <KpiCard title="Suspendidas" value={kpiData.suspended.length} color="#F59E0B" icon="⏸️" onClick={() => handleKpiClick('Suspendidas', kpiData.suspended)} />
            <KpiCard title="Vencidas" value={kpiData.expired.length} color="#DC2626" icon="⚠️" onClick={() => handleKpiClick('Vencidas', kpiData.expired)} />
            <KpiCard title="Sin Renovación" value={kpiData.sinRenovacion.length} color="#6B7280" icon="🚫" onClick={() => handleKpiClick('Sin Renovación Contrato', kpiData.sinRenovacion)} />
          </div>

        {/* Panel de Alertas */}
        <AlertPanel institutions={institutions} />

        <FilterControls filters={filters} setFilters={setFilters} totalCount={filteredInstitutions.length} />

        {/* Lista de Instituciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentInstitutions.length > 0 ? (
            currentInstitutions.map(inst => (
              <InstitutionCard 
                key={inst.id} 
                institution={inst} 
                onEdit={handleOpenEditModal}
                onFollowUp={handleOpenFollowUpModal}
                onDelete={handleDeleteInstitution}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 border-dashed">
              <EmptyStateIllustration />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No se encontraron instituciones</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
                Prueba ajustando los filtros de búsqueda, o agrega una nueva institución para empezar a hacer seguimiento.
              </p>
              <button 
                onClick={handleOpenAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar Institución
              </button>
            </div>
          )}
        </div>

        {/* Controles de Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              
              <div className="flex gap-1 hidden sm:flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-md flex items-center justify-center font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <div className="sm:hidden flex items-center px-4 text-gray-700 dark:text-gray-300 font-medium">
                Página {currentPage} de {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </main>

      <InstitutionModal 
        isOpen={isInstitutionModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveInstitution}
        institution={selectedInstitution}
      />
      
      {selectedInstitution && (
        <FollowUpModal 
          isOpen={isFollowUpModalOpen}
          onClose={handleCloseModals}
          institution={selectedInstitution}
          onAddComment={handleAddComment}
        />
      )}
      
      <KpiDetailModal 
        isOpen={kpiModalData.isOpen}
        onClose={closeKpiModal}
        title={kpiModalData.title}
        institutions={kpiModalData.institutions}
      />
    </div>
  );
}

export default App;