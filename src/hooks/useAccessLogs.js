import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Últimos accesos en vivo (solo los pueden leer los administradores)
export function useAccessLogs(enabled, max = 300) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    const q = query(collection(db, 'accessLogs'), orderBy('ts', 'desc'), limit(max));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setLogs(
          snapshot.docs.map((d) => {
            const data = d.data({ serverTimestamps: 'estimate' });
            return { id: d.id, ...data, ts: data.ts?.toDate?.() ?? new Date() };
          })
        );
        setLoading(false);
      },
      (err) => {
        console.error('Error cargando el registro de accesos:', err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [enabled, max]);

  return { logs, loading, error };
}
