import React, { useState, useEffect } from 'react';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const InstitutionModal = ({ isOpen, onClose, onSave, institution }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (institution) {
      setFormData(institution);
    } else {
      setFormData({
        nombre: '',
        categoria: 'MiPymes',
        estado: 'Validación de XML',
        fechaIngreso: new Date().toISOString().split('T')[0],
        fechaVencimiento: '',
        motivoSuspension: '',
      });
    }
    setIsSubmitting(false);
  }, [institution, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error in modal onSave:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <CloseIcon />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{institution ? 'Editar' : 'Agregar'} Institución</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Nombre de la Institución</label>
            <input 
              type="text" 
              name="nombre" 
              value={formData.nombre || ''} 
              onChange={handleChange} 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Categoría</label>
              <select 
                name="categoria" 
                value={formData.categoria || 'MiPymes'} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="MiPymes">MiPymes</option>
                <option value="Premium">Premium</option>
                <option value="Premium/Portal-MiPymes">Premium/Portal-MiPymes</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Estado</label>
              <select 
                name="estado" 
                value={formData.estado || 'Validación de XML'} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Validación de XML">Validación de XML</option>
                <option value="Revalidación de XML">Revalidación de XML</option>
                <option value="Activo">Activo</option>
                <option value="Suspendida">Suspendida</option>
                <option value="Sin Renovación Contrato">Sin Renovación Contrato</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Fecha de Ingreso</label>
            <input 
              type="date" 
              name="fechaIngreso" 
              value={formData.fechaIngreso || ''} 
              onChange={handleChange} 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              required 
            />
          </div>
          {formData.estado === 'Suspendida' ? (
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Motivo de Suspensión</label>
              <input 
                type="text" 
                name="motivoSuspension" 
                value={formData.motivoSuspension || ''} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              />
            </div>
          ) : formData.estado === 'Activo' ? (
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Fecha Primera Carga Producción</label>
              <input 
                type="date" 
                name="fechaVencimiento" 
                value={formData.fechaVencimiento || ''} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              />
            </div>
          ) : (
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Fecha Vencimiento Etapa</label>
              <input 
                type="date" 
                name="fechaVencimiento" 
                value={formData.fechaVencimiento || ''} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              />
            </div>
          )}
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`font-bold py-2 px-4 rounded-lg transition-colors ${
                isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionModal;