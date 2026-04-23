import React from 'react';
import * as XLSX from 'xlsx';
import { getDaysUntil } from '../utils/dateUtils';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ExcelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const KpiDetailModal = ({ isOpen, onClose, title, institutions }) => {
  if (!isOpen) return null;

  const renderStatusBadge = (estado) => {
    let bg = 'bg-gray-200 text-gray-800';
    if (estado === 'Activo') bg = 'bg-green-200 text-green-800';
    if (estado === 'Suspendida') bg = 'bg-yellow-200 text-yellow-800';
    if (estado === 'Sin Renovación Contrato') bg = 'bg-gray-200 text-gray-700';
    if (estado === 'Validación de XML' || estado === 'Revalidación de XML') bg = 'bg-blue-100 text-blue-800';
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${bg}`}>
        {estado}
      </span>
    );
  };

  const getDaysText = (dateStr) => {
    if (!dateStr) return 'N/A';
    const days = getDaysUntil(dateStr);
    if (days < 0) return <span className="text-red-600 dark:text-red-400 font-bold">{Math.abs(days)} días vencidos</span>;
    if (days === 0) return <span className="text-orange-600 dark:text-orange-400 font-bold">Vence hoy</span>;
    return <span>{days} días</span>;
  };

  const exportToExcel = () => {
    try {
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString + 'T00:00:00').toLocaleDateString('es-PY');
      };

      const getDaysUntilText = (dateString) => {
        if (!dateString) return 'N/A';
        const days = getDaysUntil(dateString);
        if (days < 0) return `${Math.abs(days)} días vencidos`;
        return `${days} días`;
      };

      const prepareData = (inst) => ({
        'Institución': inst.nombre,
        'Categoría': inst.categoria,
        'Estado': inst.estado,
        'Fecha Vencimiento': formatDate(inst.fechaVencimiento),
        'Días Restantes/Vencidos': getDaysUntilText(inst.fechaVencimiento)
      });

      const data = institutions.map(prepareData);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      
      // Ajustar ancho de columnas
      const wscols = [
        {wch: 40}, // Institución
        {wch: 25}, // Categoría
        {wch: 20}, // Estado
        {wch: 20}, // Fecha Vencimiento
        {wch: 25}  // Días
      ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, 'Detalle');
      
      const safeTitle = title.replace(/[\/\\]/g, '-');
      const fileName = `Detalle_${safeTitle}_${new Date().toLocaleDateString('es-PY').replace(/\//g, '-')}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('Hubo un error al exportar el archivo Excel.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl relative h-[85vh] flex flex-col animate-fadeIn" style={{ zIndex: 10000 }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
          <CloseIcon />
        </button>
        
        <div className="mb-6 pr-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Detalle: <span className="text-blue-600 dark:text-blue-400">{title}</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Total encontradas: {institutions.length}
          </p>
        </div>

        <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-inner">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 relative">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300 sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-600">Institución</th>
                <th scope="col" className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-600">Categoría</th>
                <th scope="col" className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-600">Estado</th>
                <th scope="col" className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-600">Vencimiento</th>
                <th scope="col" className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-600 text-center">Días</th>
              </tr>
            </thead>
            <tbody>
              {institutions.length > 0 ? (
                institutions.map((inst, idx) => (
                  <tr key={inst.id || idx} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{inst.nombre}</td>
                    <td className="px-6 py-4">{inst.categoria}</td>
                    <td className="px-6 py-4">{renderStatusBadge(inst.estado)}</td>
                    <td className="px-6 py-4">{inst.fechaVencimiento ? new Date(inst.fechaVencimiento + 'T00:00:00').toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-center">{getDaysText(inst.fechaVencimiento)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                    No hay instituciones en este segmento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <button 
            onClick={exportToExcel}
            disabled={institutions.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExcelIcon />
            Descargar Excel
          </button>
          
          <button 
            onClick={onClose} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default KpiDetailModal;
