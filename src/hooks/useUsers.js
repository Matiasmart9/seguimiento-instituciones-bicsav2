import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth, db, firebaseConfig } from '../firebase/firebaseConfig';

// Lista de usuarios en vivo (solo la pueden leer los administradores)
export function useUsers(enabled) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
        list.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
        setUsers(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando usuarios:', error);
        setError(error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [enabled]);

  return { users, loading, error };
}

export const updateUserProfile = (uid, patch) => updateDoc(doc(db, 'users', uid), patch);

export const sendResetEmail = (email) => sendPasswordResetEmail(auth, email);

// Crea la cuenta en Firebase Auth con una segunda instancia de la app, para no cerrar la sesión
// del administrador (crear un usuario inicia sesión con él), y luego guarda su perfil.
export async function createUserAccount({ nombre, email, password, rol, permisos }, createdBy) {
  const secondary = initializeApp(firebaseConfig, `usuarios-${Date.now()}`);
  try {
    const secondaryAuth = getAuth(secondary);
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await signOut(secondaryAuth);

    await setDoc(doc(db, 'users', credential.user.uid), {
      email: credential.user.email,
      nombre,
      rol,
      activo: true,
      pendiente: false,
      permisos,
      creadoPor: createdBy,
      fechaCreacion: new Date().toISOString(),
    });
    return credential.user.uid;
  } finally {
    await deleteApp(secondary);
  }
}
