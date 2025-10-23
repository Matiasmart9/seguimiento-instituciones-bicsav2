import React, { useState } from 'react';
import { getAlertStatus, getDaysUntil } from '../utils/dateUtils';

const AlertPanel = ({ institutions }) => {
  const [showAll, setShowAll] = useState(false);
  
  // CORREGIDO: Mostrar instituciones vencidas y por vencer (hasta 8 días)
  const criticalInstitutions = institutions.filter(inst => {
    if (inst.estado === 'Activo' || inst.estado === 'Suspendida') return false;
    if (!inst.fechaVencimiento) return false;
    
    const daysUntil = getDaysUntil(inst.fechaVencimiento);
    // MOSTRAR: vencidas (días < 0) Y por vencer (0-8 días)
    return daysUntil <= 8;
  }).sort((a, b) => {
    const daysA = getDaysUntil(a.fechaVencimiento);
    const daysB = getDaysUntil(b.fechaVencimiento);
    return daysA - daysB;
  });

  // Limitar a 6 instituciones si no se muestra todo
  const displayedInstitutions = showAll ? criticalInstitutions : criticalInstitutions.slice(0, 6);
  const hasMore = criticalInstitutions.length > 6;

  if (criticalInstitutions.length === 0) {
    return (
      <div className="bg-green-50 rounded-lg shadow-md p-6 mb-6 border-l-4 border-green-500">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <h2 className="text-xl font-bold text-green-700">Estado de Validaciones</h2>
        </div>
        <p className="text-green-600 mt-2">No hay validaciones críticas en este momento.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'expired': return 'bg-red-100 border-red-300 text-red-800';
      case 'critical': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'expired': return '🔴';
      case 'critical': return '🟠';
      case 'warning': return '🟡';
      default: return '⚪';
    }
  };

  // Contadores por categoría CON LOS NUEVOS RANGOS
  const expiredCount = criticalInstitutions.filter(inst => getDaysUntil(inst.fechaVencimiento) < 0).length;
  const criticalCount = criticalInstitutions.filter(inst => {
    const days = getDaysUntil(inst.fechaVencimiento);
    return days >= 0 && days <= 5; // CAMBIADO de 2 a 5
  }).length;
  const warningCount = criticalInstitutions.filter(inst => {
    const days = getDaysUntil(inst.fechaVencimiento);
    return days >= 6 && days <= 8; // CAMBIADO de 3-5 a 6-8
  }).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-red-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔴</span>
          <h2 className="text-xl font-bold text-red-700">ALERTA: Validaciones Críticas</h2>
        </div>
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
          {criticalInstitutions.length} institución{criticalInstitutions.length !== 1 ? 'es' : ''}
        </span>
      </div>
      
      <div className={`overflow-x-auto ${!showAll && hasMore ? 'max-h-80' : ''} overflow-y-auto`}>
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="text-left py-3 font-semibold px-4">Institución</th>
              <th className="text-left py-3 font-semibold px-4">Vencimiento</th>
              <th className="text-left py-3 font-semibold px-4">Estado</th>
              <th className="text-left py-3 font-semibold px-4">Días</th>
            </tr>
          </thead>
          <tbody>
            {displayedInstitutions.map((inst) => {
              const alertStatus = getAlertStatus(inst.fechaVencimiento);
              const daysUntil = getDaysUntil(inst.fechaVencimiento);
              
              return (
                <tr key={inst.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium px-4">
                    <div className="max-w-xs truncate" title={inst.nombre}>
                      {inst.nombre}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {inst.fechaVencimiento ? new Date(inst.fechaVencimiento + 'T00:00:00').toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(alertStatus.type)}`}>
                      {getStatusIcon(alertStatus.type)} {alertStatus.text}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${
                      daysUntil < 0 ? 'text-red-600' : 
                      daysUntil <= 5 ? 'text-orange-600' : // CAMBIADO de 2 a 5
                      'text-yellow-600'
                    }`}>
                      {daysUntil < 0 ? Math.abs(daysUntil) + ' días vencidos' : daysUntil + ' días'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Controles para mostrar más/menos */}
      {hasMore && (
        <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {showAll ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                Mostrar menos
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                Mostrar todas ({criticalInstitutions.length})
              </>
            )}
          </button>
        </div>
      )}

      {/* Resumen rápido CON LOS NUEVOS TEXTOS */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 justify-center">
          <span className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
            <span>🔴</span> Vencidas: {expiredCount}
          </span>
          <span className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
            <span>🟠</span> Críticas (≤5 días): {criticalCount} {/* CAMBIADO de 2 a 5 */}
          </span>
          <span className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
            <span>🟡</span> Advertencia (6-8 días): {warningCount} {/* CAMBIADO de 3-5 a 6-8 */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;