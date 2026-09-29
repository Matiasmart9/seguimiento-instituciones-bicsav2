import { useState, useRef } from 'react';
import RichText from './RichText';
import ConfirmationModal from './ConfirmationModal';
import { toggleWrap } from '../utils/richText';
import { useToast } from '../context/ToastContext';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18"></path>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const FollowUpModal = ({ isOpen, onClose, institution, onAddComment, onDeleteComment }) => {
  const [newComment, setNewComment] = useState('');
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const textareaRef = useRef(null);

  if (!isOpen) return null;

  const handleAddComment = async () => {
    if (newComment.trim()) {
      setLoading(true);
      try {
        await onAddComment(institution.id, newComment);
        setNewComment('');
      } catch (error) {
        console.error('Error al agregar comentario:', error);
        toast.error('Error al agregar comentario. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const applyFormat = (marker) => {
    const el = textareaRef.current;
    if (!el) return;
    const result = toggleWrap(newComment, el.selectionStart, el.selectionEnd, marker);
    setNewComment(result.value);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.start, result.end);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddComment();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormat('**');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyFormat('*');
    }
  };

  const handleClose = () => {
    setNewComment('');
    setLoading(false);
    onClose();
  };

  const handleConfirmDeleteComment = async () => {
    const comment = commentToDelete;
    setCommentToDelete(null);
    try {
      await onDeleteComment(institution.id, comment);
      toast.success('Comentario eliminado');
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      toast.error('Error al eliminar el comentario. Por favor, intenta nuevamente.');
    }
  };

  const comments = institution.comentarios ? [...institution.comentarios].reverse() : [];

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="h-full flex justify-center items-center p-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-5 sm:p-6 w-full max-w-2xl relative flex flex-col h-full max-h-[48rem]">
          <button onClick={handleClose} aria-label="Cerrar" className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
            <CloseIcon />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold pr-8 text-gray-900 dark:text-white">
            Seguimiento de: <span className="text-blue-600 dark:text-blue-400">{institution.nombre}</span>
          </h2>

          {/* Título fijo: solo la lista de comentarios se desplaza */}
          <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3 flex items-center justify-between">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">Historial de Comentarios</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {comments.length} comentario{comments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Ocupa todo el espacio libre: en pantallas normales caben varios comentarios */}
          <div className="flex-1 min-h-[9rem] overflow-y-auto pr-2 mt-2">
            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment, index) => (
                  <div key={index} className="group relative bg-gray-100 dark:bg-gray-700 p-3 pr-10 rounded-md">
                    <button
                      type="button"
                      onClick={() => setCommentToDelete(comment)}
                      title="Eliminar comentario"
                      aria-label="Eliminar comentario"
                      className="absolute top-2 right-2 p-1.5 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity"
                    >
                      <TrashIcon />
                    </button>
                    <RichText text={comment.texto} className="text-gray-800 dark:text-gray-200" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
                      Por <strong className="text-gray-800 dark:text-gray-200">{comment.autor}</strong> el {new Date(comment.fecha).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No hay comentarios todavía.</p>
            )}
          </div>

          <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-base text-gray-900 dark:text-white mr-2">Nuevo comentario</h3>
                <button
                  type="button"
                  onClick={() => applyFormat('**')}
                  title="Negrita (Ctrl+B)"
                  aria-label="Negrita"
                  disabled={loading}
                  className="w-7 h-7 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('*')}
                  title="Cursiva (Ctrl+I)"
                  aria-label="Cursiva"
                  disabled={loading}
                  className="w-7 h-7 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm italic font-serif hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  I
                </button>
              </div>
              {newComment.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{newComment.length} caracteres</span>
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows="2"
              placeholder="Escribe tu comentario aquí..."
              disabled={loading}
            ></textarea>

            <div className="flex items-center justify-between gap-3 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Ctrl + Enter para enviar</span>
              <button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                className="inline-flex items-center gap-2 py-2 px-5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  'Agregar comentario'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmationModal
      isOpen={commentToDelete !== null}
      onClose={() => setCommentToDelete(null)}
      onConfirm={handleConfirmDeleteComment}
      title="Eliminar comentario"
      message="¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer."
      confirmText="Eliminar"
      cancelText="Cancelar"
    />
    </>
  );
};

export default FollowUpModal;