import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './useAuth';

export function useInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setInstitutions([]);
      setLoading(false);
      return;
    }

    console.log('🔍 Suscribiéndose a TODAS las instituciones para usuario:', user.email);
    
    // QUITAR el filtro by userId - mostrar todas las instituciones
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
        console.log('📊 Todas las instituciones cargadas:', institutionsData.length);
        setInstitutions(institutionsData);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error cargando instituciones:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const addInstitution = async (institutionData) => {
    if (!user) throw new Error('Usuario no autenticado');

    const institutionWithUser = {
      ...institutionData,
      // Mantener información del usuario que creó, pero no filtrar
      creadoPor: user.email,
      userId: user.uid,
      fechaCreacion: new Date().toISOString()
    };

    console.log('➕ Agregando institución por usuario:', user.email);
    const docRef = await addDoc(collection(db, 'institutions'), institutionWithUser);
    return docRef.id;
  };

  const updateInstitution = async (id, institutionData) => {
    if (!user) throw new Error('Usuario no autenticado');

    console.log('✏️ Actualizando institución:', id, 'por usuario:', user.email);
    await updateDoc(doc(db, 'institutions', id), institutionData);
  };

  const addComment = async (institutionId, commentText) => {
    if (!user) throw new Error('Usuario no autenticado');

    console.log('💬 Agregando comentario como:', user.email);
    
    const comment = {
      texto: commentText,
      autor: user.email, // Usar el email del usuario actual
      fecha: new Date().toISOString(),
      userId: user.uid
    };

    const institution = institutions.find(inst => inst.id === institutionId);
    if (!institution) throw new Error('Institución no encontrada');

    const updatedComments = institution.comentarios 
      ? [...institution.comentarios, comment]
      : [comment];

    await updateDoc(doc(db, 'institutions', institutionId), {
      comentarios: updatedComments
    });
  };

  return {
    institutions,
    loading,
    addInstitution,
    updateInstitution,
    addComment
  };
}