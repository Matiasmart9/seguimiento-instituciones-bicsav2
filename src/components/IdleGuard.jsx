import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { useIdleLogout, IDLE_TIMEOUT_MINUTES } from '../hooks/useIdleLogout';

// Cierra la sesión tras 30 minutos sin actividad, avisando un minuto antes.
// Se monta una sola vez, fuera de las vistas, así funciona en todas las pantallas.
const IdleGuard = () => {
  const { user } = useAuth();
  const { secondsLeft, stay } = useIdleLogout({
    enabled: Boolean(user),
    onTimeout: () => signOut(auth).catch((error) => console.error('Error al cerrar sesión por inactividad:', error)),
  });

  if (!user || secondsLeft === null) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" style={{ zIndex: 30000 }} role="alertdialog" aria-modal="true" aria-labelledby="idle-title">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 id="idle-title" className="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Sigues ahí?</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Por seguridad, tu sesión se cerrará en{' '}
          <strong className="text-red-600 dark:text-red-400 tabular-nums">{secondsLeft}</strong> segundo{secondsLeft !== 1 ? 's' : ''} por inactividad.
        </p>
        <p className="text-xs text-gray-400 mt-1">Se cierra automáticamente tras {IDLE_TIMEOUT_MINUTES} minutos sin usar el portal.</p>
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold transition-colors"
          >
            Cerrar sesión
          </button>
          <button
            onClick={stay}
            autoFocus
            className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
          >
            Seguir conectado
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdleGuard;
