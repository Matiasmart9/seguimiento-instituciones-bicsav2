import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { newProfileFor, resolveAccess } from '../utils/permissions';

// Escucha el perfil del usuario (users/{uid}) en vivo: si un administrador cambia sus permisos,
// se aplican al instante. Si todavía no tiene perfil, se crea uno pendiente de aprobación.
export function useAccess(user) {
  const [state, setState] = useState({ uid: null, profile: undefined });

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setState({ uid: user.uid, profile: snap.data() });
          return;
        }
        setState({ uid: user.uid, profile: null });
        setDoc(ref, newProfileFor(user)).catch((error) => console.error('No se pudo crear el perfil:', error));
      },
      (error) => {
        console.error('Error cargando el perfil:', error);
        setState({ uid: user.uid, profile: null, error: true });
      }
    );

    return unsubscribe;
  }, [user]);

  const ready = Boolean(user) && state.uid === user.uid && state.profile !== undefined;
  const access = useMemo(
    () => resolveAccess(user, ready ? state.profile : undefined),
    [user, ready, state.profile]
  );

  return { access, profile: ready ? state.profile : undefined, loading: Boolean(user) && !ready };
}
