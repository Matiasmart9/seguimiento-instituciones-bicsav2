import React, { useState, useMemo } from 'react';
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

function App() {
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState({ estado: 'Todos', categoria: 'Todos', search: '' });
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  
  const { institutions, loading: institutionsLoading, addInstitution, updateInstitution, deleteInstitution, addComment } = useInstitutions();

  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      const estadoMatch = filters.estado === 'Todos' || inst.estado === filters.estado;
      const categoriaMatch = filters.categoria === 'Todos' || inst.categoria === filters.categoria;
      const searchMatch = !filters.search || 
        inst.nombre.toLowerCase().includes(filters.search.toLowerCase());
      
      return estadoMatch && categoriaMatch && searchMatch;
    });
  }, [institutions, filters]);

  const kpiData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      total: institutions.length,
      validacionMipymes: institutions.filter(i => 
        i.estado === 'Validación de XML' && i.categoria === 'MiPymes'
      ).length,
      validacionPremium: institutions.filter(i => 
        i.estado === 'Validación de XML' && i.categoria === 'Premium'
      ).length,
      validacionPremiumPortal: institutions.filter(i => 
        i.estado === 'Validación de XML' && i.categoria === 'Premium/Portal-MiPymes'
      ).length, // NUEVO KPI
      revalidacion: institutions.filter(i => i.estado === 'Revalidación de XML').length,
      activas: institutions.filter(i => i.estado === 'Activo').length,
      suspended: institutions.filter(i => i.estado === 'Suspendida').length,
      expired: institutions.filter(i => {
        if (!i.fechaVencimiento) return false;
        const dueDate = new Date(i.fechaVencimiento + 'T00:00:00');
        return (i.estado === 'Validación de XML' || i.estado === 'Revalidación de XML') && dueDate < today;
      }).length,
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
            <KpiCard title="Total" value={kpiData.total} color="#1D4ED8" icon="🏢" />
            <KpiCard title="Valid. XML MiPymes" value={kpiData.validacionMipymes} color="#16A34A" icon="📊" />
            <KpiCard title="Valid. xml Premium" value={kpiData.validacionPremium} color="#059669" icon="⭐" />
            <KpiCard title="Valid. Premium/Portal" value={kpiData.validacionPremiumPortal} color="#7C3AED" icon="🌐" /> {/* NUEVO KPI */}
            <KpiCard title="Revalidación Inst. Activas" value={kpiData.revalidacion} color="#CA8A04" icon="🔄" />
            <KpiCard title="Activas" value={kpiData.activas} color="#10B981" icon="✅" />
            <KpiCard title="Suspendidas" value={kpiData.suspended} color="#F59E0B" icon="⏸️" />
            <KpiCard title="Vencidas" value={kpiData.expired} color="#DC2626" icon="⚠️" />
          </div>

        {/* Panel de Alertas */}
        <AlertPanel institutions={institutions} />

        <FilterControls filters={filters} setFilters={setFilters} />

        {/* Lista de Instituciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.length > 0 ? (
            filteredInstitutions.map(inst => (
              <InstitutionCard 
                key={inst.id} 
                institution={inst} 
                onEdit={handleOpenEditModal}
                onFollowUp={handleOpenFollowUpModal}
                onDelete={handleDeleteInstitution}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 text-xl mb-4">
                No se encontraron instituciones con los filtros seleccionados.
              </p>
              <button 
                onClick={handleOpenAddModal}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              >
                Agregar Primera Institución
              </button>
            </div>
          )}
        </div>
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
    </div>
  );
}

export default App;