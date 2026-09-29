import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './useAuth';
import { buildEntry, diffInstitution, commentPreview } from '../utils/audit';

// `enabled` evita consultar Firestore hasta saber que el usuario tiene acceso (perfil activo)
export function useInstitutions(enabled = true) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !enabled) return;
    const q = query(
      collection(db, 'institutions'),
      orderBy('fechaIngreso', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const institutionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInstitutions(institutionsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando instituciones:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      setInstitutions([]);
      setLoading(true);
    };
  }, [user, enabled]);

  const addInstitution = async (institutionData) => {
    if (!user) throw new Error('Usuario no autenticado');

    const institutionWithUser = {
      ...institutionData,
      // Se guarda quién creó el registro (todas las instituciones son visibles para todos)
      creadoPor: user.email,
      userId: user.uid,
      fechaCreacion: new Date().toISOString(),
      historial: [buildEntry(user, 'institucion_creada', `Registro creado en estado "${institutionData.estado}"`)]
    };
    const docRef = await addDoc(collection(db, 'institutions'), institutionWithUser);
    return docRef.id;
  };

  const updateInstitution = async (id, institutionData) => {
    if (!user) throw new Error('Usuario no autenticado');
    // El formulario trae una copia de comentarios e historial: no se reenvían para no pisar
    // lo que otros usuarios hayan agregado mientras tanto.
    const { id: _id, comentarios: _comentarios, historial: _historial, ...fields } = institutionData;

    const previous = institutions.find((inst) => inst.id === id);
    const entries = previous ? diffInstitution(user, previous, fields) : [];

    await updateDoc(doc(db, 'institutions', id), {
      ...fields,
      ...(entries.length > 0 && { historial: arrayUnion(...entries) })
    });
  };

  const deleteInstitution = async (id) => {
    if (!user) throw new Error('Usuario no autenticado');
    await deleteDoc(doc(db, 'institutions', id));
  };

  const addComment = async (institutionId, commentText) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const comment = {
      texto: commentText,
      autor: user.email, // Usar el email del usuario actual
      fecha: new Date().toISOString(),
      userId: user.uid
    };

    // arrayUnion evita pisar comentarios si dos usuarios comentan a la vez
    await updateDoc(doc(db, 'institutions', institutionId), {
      comentarios: arrayUnion(comment),
      historial: arrayUnion(buildEntry(user, 'comentario_agregado', commentPreview(comment)))
    });
  };

  // arrayRemove exige el objeto idéntico al guardado; se recibe tal cual viene del snapshot
  const deleteComment = async (institutionId, comment) => {
    if (!user) throw new Error('Usuario no autenticado');

    await updateDoc(doc(db, 'institutions', institutionId), {
      comentarios: arrayRemove(comment),
      historial: arrayUnion(
        buildEntry(user, 'comentario_eliminado', `"${commentPreview(comment)}" (escrito por ${comment.autor})`)
      )
    });
  };

  const isActive = Boolean(user) && enabled;

  return {
    institutions: isActive ? institutions : [],
    loading: isActive ? loading : false,
    addInstitution,
    updateInstitution,
    deleteInstitution,
    addComment,
    deleteComment
  };
}