import React, { useState } from 'react';
import { getAlertStatus } from '../utils/dateUtils';
import ConfirmationModal from './ConfirmationModal';

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

const InstitutionCard = ({ institution, onEdit, onFollowUp, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getStatusPillClass = (institution) => {
    if (institution.estado === 'Suspendida') {
      return 'bg-yellow-200 text-yellow-800';
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
    
    return 'bg-gray-200 text-gray-800';
  };

  const getDateInfo = (institution) => {
    if (institution.estado === 'Validación de XML' || institution.estado === 'Revalidación de XML') {
      const alertStatus = getAlertStatus(institution.fechaVencimiento);
      return alertStatus ? alertStatus.text : null;
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
      <div className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 h-full">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800">{institution.nombre}</h3>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusPillClass}`}>
              {institution.estado}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">{institution.categoria}</p>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Fecha de Ingreso:</strong> {new Date(institution.fechaIngreso + 'T00:00:00').toLocaleDateString()}</p>
            {institution.motivoSuspension && <p><strong>Motivo:</strong> {institution.motivoSuspension}</p>}
            {dateInfo && (
              <p>
                <strong className={
                  statusPillClass.includes('red') ? 'text-red-800' :
                  statusPillClass.includes('orange') ? 'text-orange-800' :
                  statusPillClass.includes('green') ? 'text-green-800' :
                  'text-gray-800'
                }>
                  {dateInfo}
                </strong>
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <button 
            onClick={() => onFollowUp(institution)} 
            className="text-gray-600 hover:text-blue-600 flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Ver seguimiento"
          >
            <CommentIcon /> 
            <span className="hidden sm:inline">Seguimiento</span> ({institution.comentarios?.length || 0})
          </button>
          <button 
            onClick={() => onEdit(institution)} 
            className="text-gray-600 hover:text-green-600 flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Editar institución"
          >
            <EditIcon /> 
            <span className="hidden sm:inline">Editar</span>
          </button>
          <button 
            onClick={handleDeleteClick}
            className="text-gray-600 hover:text-red-600 flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Eliminar institución"
          >
            <DeleteIcon /> 
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
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