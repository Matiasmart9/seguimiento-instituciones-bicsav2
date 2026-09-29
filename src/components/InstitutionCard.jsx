import React, { useState } from 'react';
import { getAlertStatus } from '../utils/dateUtils';
import ConfirmationModal from './ConfirmationModal';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1 text-gray-400">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const AuditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
    <rect x="9" y="3" width="6" height="4" rx="1"></rect>
    <line x1="9" y1="12" x2="15" y2="12"></line>
    <line x1="9" y1="16" x2="13" y2="16"></line>
  </svg>
);

const InstitutionCard = ({ institution, onEdit, onFollowUp, onAudit, onDelete, can = {} }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

const getStatusPillClass = (institution) => {
  if (institution.estado === 'Suspendida') {
    return 'bg-yellow-200 text-yellow-800';
  }
  
  if (institution.estado === 'Activo') {
    return 'bg-green-200 text-green-800';
  }

  if (institution.estado === 'Sin Renovación Contrato') {
    return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
  }
  
  if (institution.estado === 'Validación de XML' || institution.estado === 'Revalidación de XML') {
    const alertStatus = getAlertStatus(institution.fechaVencimiento);
    if (alertStatus) {
      switch (alertStatus.type) {
        case 'expired': return 'bg-red-200 text-red-800';
        case 'critical': return 'bg-orange-200 text-orange-800';
        case 'warning': return 'bg-orange-100 text-orange-800';
        default: return 'bg-green-200 text-green-800';
      }
    }
  }
  
  return 'bg-gray-200 text-gray-800 dark:text-white';
};

const getDateInfo = (institution) => {
  if (institution.estado === 'Validación de XML' || institution.estado === 'Revalidación de XML') {
    const alertStatus = getAlertStatus(institution.fechaVencimiento);
    return alertStatus ? alertStatus.text : null;
  }
  if (institution.estado === 'Activo' && institution.fechaVencimiento) {
    return `En producción desde ${new Date(institution.fechaVencimiento + 'T00:00:00').toLocaleDateString()}`;
  }
  if (institution.estado === 'Sin Renovación Contrato' && institution.fechaVencimiento) {
    return `Contrato finalizado el ${new Date(institution.fechaVencimiento + 'T00:00:00').toLocaleDateString()}`;
  }
  return null;
};

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(institution.id);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const statusPillClass = getStatusPillClass(institution);
  const dateInfo = getDateInfo(institution);

  return (
    <>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between h-full border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
          {/* Acento superior de color según estado */}
          <div className={`absolute top-0 left-0 w-full h-1 ${
            statusPillClass.includes('red') ? 'bg-red-500' :
            statusPillClass.includes('orange') ? 'bg-orange-500' :
            statusPillClass.includes('yellow') ? 'bg-yellow-500' :
            statusPillClass.includes('green') ? 'bg-green-500' :
            'bg-gray-400'
          }`}></div>
          
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white pr-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{institution.nombre}</h3>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap shadow-sm border border-transparent ${statusPillClass}`}>
                {institution.estado}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 font-medium">{institution.categoria}</p>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600/50">
            <p className="flex items-center">
              <CalendarIcon /> 
              <span>Ingreso: {new Date(institution.fechaIngreso + 'T00:00:00').toLocaleDateString()}</span>
            </p>
            {institution.motivoSuspension && (
              <p className="flex items-start text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                <AlertIcon />
                <span className="leading-tight">{institution.motivoSuspension}</span>
              </p>
            )}
            {dateInfo && (
              <p className="flex items-center">
                <strong className={`flex items-center ${
                  statusPillClass.includes('red') ? 'text-red-600 dark:text-red-400' :
                  statusPillClass.includes('orange') ? 'text-orange-600 dark:text-orange-400' :
                  statusPillClass.includes('green') ? 'text-green-600 dark:text-green-400' :
                  'text-gray-800 dark:text-gray-200'
                }`}>
                  <CalendarIcon />
                  {dateInfo}
                </strong>
              </p>
            )}
          </div>
        </div>
        {(can.seguimiento || can.editar || can.auditoria || can.eliminar) && (
        <div className="flex flex-wrap justify-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-200">
          {can.seguimiento && (
          <button
            onClick={() => onFollowUp(institution)}
            className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-all font-medium text-sm"
            title="Ver seguimiento"
            aria-label="Ver seguimiento"
          >
            <CommentIcon />
            <span className="bg-gray-200 dark:bg-gray-600 text-xs px-1.5 rounded-full ml-1">{institution.comentarios?.length || 0}</span>
          </button>
          )}
          {can.editar && (
          <button
            onClick={() => onEdit(institution)}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1.5 px-2.5 py-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/30 transition-all font-medium text-sm"
            title="Editar institución"
            aria-label="Editar institución"
          >
            <EditIcon />
          </button>
          )}
          {can.auditoria && (
          <button
            onClick={() => onAudit(institution)}
            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 flex items-center gap-1.5 px-2.5 py-2 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-all font-medium text-sm"
            title="Auditoría (historial de movimientos)"
            aria-label="Auditoría"
          >
            <AuditIcon />
          </button>
          )}
          {can.eliminar && (
          <button
            onClick={handleDeleteClick}
            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1.5 px-2.5 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-all font-medium text-sm"
            title="Eliminar institución"
            aria-label="Eliminar institución"
          >
            <DeleteIcon />
          </button>
          )}
        </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar la institución "${institution.nombre}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default InstitutionCard;