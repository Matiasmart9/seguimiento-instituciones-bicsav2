import React from 'react';
import * as XLSX from 'xlsx';
import ThemeToggle from './ThemeToggle';
import WeatherWidget from './WeatherWidget';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ExcelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const Header = ({ onAddInstitution, onLogout, institutions }) => {
  
  const exportToExcel = () => {
    try {
      // Función helper para formatear fechas
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString + 'T00:00:00').toLocaleDateString('es-PY');
      };

      // Función helper para calcular días hasta vencimiento
      const getDaysUntil = (dateString) => {
        if (!dateString) return 'N/A';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(dateString + 'T00:00:00');
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return `${Math.abs(diffDays)} días vencidos`;
        return `${diffDays} días`;
      };

      // Función para obtener el último comentario
      const getLastComment = (inst) => {
        if (!inst.comentarios || inst.comentarios.length === 0) {
          return 'Sin comentarios';
        }
        const lastComment = inst.comentarios[inst.comentarios.length - 1];
        const fecha = new Date(lastComment.fecha).toLocaleString('es-PY');
        return `${lastComment.texto} - Por ${lastComment.autor} (${fecha})`;
      };

      // Función para preparar datos comunes
      const prepareInstitutionData = (inst) => ({
        'Institución': inst.nombre,
        'Categoría': inst.categoria,
        'Estado': inst.estado,
        'Fecha de Ingreso': formatDate(inst.fechaIngreso),
        'Fecha de Vencimiento': formatDate(inst.fechaVencimiento),
        'Días hasta Vencimiento': getDaysUntil(inst.fechaVencimiento),
        'Motivo Suspensión': inst.motivoSuspension || 'N/A',
        'Cantidad de Comentarios': inst.comentarios?.length || 0,
        'Último Comentario': getLastComment(inst)
      });

      // Filtrar instituciones por categoría y estado
      const mipymes = institutions
        .filter(i => i.categoria === 'MiPymes' && i.estado === 'Validación de XML')
        .map(prepareInstitutionData);

      const premium = institutions
        .filter(i => i.categoria === 'Premium' && i.estado === 'Validación de XML')
        .map(prepareInstitutionData);

      const premiumPortal = institutions 
        .filter(i => i.categoria === 'Premium/Portal-MiPymes' && i.estado === 'Validación de XML')
        .map(prepareInstitutionData);

      const activas = institutions
        .filter(i => i.estado === 'Activo')
        .map(prepareInstitutionData);

      const suspendidas = institutions
        .filter(i => i.estado === 'Suspendida')
        .map(prepareInstitutionData);

      const revalidacion = institutions
        .filter(i => i.estado === 'Revalidación de XML')
        .map(prepareInstitutionData);

      // Crear resumen general
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const resumen = [{
        'Métrica': 'Total de Instituciones',
        'Cantidad': institutions.length
      }, {
        'Métrica': 'Validación XML MiPymes',
        'Cantidad': mipymes.length
      }, {
        'Métrica': 'Validación XML Premium',
        'Cantidad': premium.length
      }, {
        'Métrica': 'Validación Premium/Portal-MiPymes', 
        'Cantidad': premiumPortal.length
      }, {
        'Métrica': 'Revalidación Inst. Activas',
        'Cantidad': revalidacion.length
      }, {
        'Métrica': 'Activas',
        'Cantidad': activas.length
      }, {
        'Métrica': 'Suspendidas',
        'Cantidad': suspendidas.length
      }, {
        'Métrica': 'Vencidas',
        'Cantidad': institutions.filter(i => {
          if (!i.fechaVencimiento) return false;
          const dueDate = new Date(i.fechaVencimiento + 'T00:00:00');
          return (i.estado === 'Validación de XML' || i.estado === 'Revalidación de XML') && dueDate < today;
        }).length
      }];

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();

      // Agregar hoja de resumen
      const wsResumen = XLSX.utils.json_to_sheet(resumen);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Agregar hojas con datos
      if (mipymes.length > 0) {
        const wsMipymes = XLSX.utils.json_to_sheet(mipymes);
        XLSX.utils.book_append_sheet(wb, wsMipymes, 'MiPymes');
      }

      if (premium.length > 0) {
        const wsPremium = XLSX.utils.json_to_sheet(premium);
        XLSX.utils.book_append_sheet(wb, wsPremium, 'Premium');
      }

      if (premiumPortal.length > 0) { 
        const wsPremiumPortal = XLSX.utils.json_to_sheet(premiumPortal);
        XLSX.utils.book_append_sheet(wb, wsPremiumPortal, 'Premium-Portal');
      }

      if (activas.length > 0) {
        const wsActivas = XLSX.utils.json_to_sheet(activas);
        XLSX.utils.book_append_sheet(wb, wsActivas, 'Activas');
      }

      if (revalidacion.length > 0) {
        const wsRevalidacion = XLSX.utils.json_to_sheet(revalidacion);
        XLSX.utils.book_append_sheet(wb, wsRevalidacion, 'Revalidación');
      }

      if (suspendidas.length > 0) {
        const wsSuspendidas = XLSX.utils.json_to_sheet(suspendidas);
        XLSX.utils.book_append_sheet(wb, wsSuspendidas, 'Suspendidas');
      }

      // Generar nombre de archivo con fecha
      const fileName = `Instituciones_${new Date().toLocaleDateString('es-PY').replace(/\//g, '-')}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, fileName);

      console.log('✅ Archivo Excel exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, intenta nuevamente.');
    }
  };

  return (
    <header className="bg-[#fa8b31] dark:bg-orange-800 shadow-md p-5 flex justify-between items-center mb-2 relative">
      {/* Widget del clima en la esquina superior izquierda */}
      <div className="absolute top-2 left-5 z-10">
        <WeatherWidget />
      </div>
      
      <div className="flex items-center justify-center flex-1">
        <h1 className="text-3xl font-bold text-white">Seguimiento Instituciones BICSA</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button
          onClick={onAddInstitution}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform duration-200 hover:scale-105"
        >
          <PlusIcon />
          <span>Agregar Institución</span>
        </button>
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform duration-200 hover:scale-105"
        >
          <ExcelIcon />
          <span>Exportar Excel</span>
        </button>
        <button
          onClick={onLogout}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;