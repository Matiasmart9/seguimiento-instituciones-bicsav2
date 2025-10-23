import React, { useState } from 'react';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const FollowUpModal = ({ isOpen, onClose, institution, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddComment = async () => {
    if (newComment.trim()) {
      setLoading(true);
      try {
        console.log('📝 Agregando comentario:', newComment);
        await onAddComment(institution.id, newComment);
        // CORRECCIÓN: Limpiar el textarea solo después de que se complete la operación
        setNewComment('');
        console.log('✅ Comentario agregado en UI - textarea limpiado');
      } catch (error) {
        console.error('❌ Error al agregar comentario:', error);
        alert('Error al agregar comentario. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault(); // CORRECCIÓN: Prevenir comportamiento por defecto
      handleAddComment();
    }
  };

  // CORRECCIÓN: Resetear el estado cuando se cierra el modal
  const handleClose = () => {
    setNewComment('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl relative flex flex-col" style={{height: '80vh'}}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <CloseIcon />
        </button>
        <h2 className="text-2xl font-bold mb-2">
          Seguimiento de: <span className="text-blue-600">{institution.nombre}</span>
        </h2>
        
        <div className="flex-grow overflow-y-auto pr-4 mt-4 border-t pt-4">
          <h3 className="font-semibold text-lg mb-4">Historial de Comentarios</h3>
          {institution.comentarios && institution.comentarios.length > 0 ? (
            <div className="space-y-4">
              {[...institution.comentarios].reverse().map((comment, index) => (
                <div key={index} className="bg-gray-100 p-3 rounded-md">
                  <p className="text-gray-800">{comment.texto}</p>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    Por <strong>{comment.autor}</strong> el {new Date(comment.fecha).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No hay comentarios todavía.</p>
          )}
        </div>
        
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold text-lg mb-2">Agregar Nuevo Comentario</h3>
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyPress} // CORRECCIÓN: Cambiado a onKeyDown
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Escribe tu comentario aquí... (Ctrl + Enter para enviar)"
            disabled={loading}
          ></textarea>
          <button 
            onClick={handleAddComment} 
            disabled={loading || !newComment.trim()}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              'Agregar Comentario'
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {newComment.trim().length > 0 ? 
              `Listo para guardar (${newComment.length} caracteres)` : 
              'Escribe un comentario para habilitar el botón'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;