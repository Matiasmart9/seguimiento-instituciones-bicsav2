import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';

// Registro de accesos: cada inicio y cierre de sesión se guarda en la colección `accessLogs`.
// La hora la pone el servidor (serverTimestamp) y las reglas impiden falsificarla o escribir a nombre de otro usuario.
export const ACCESS_EVENTS = {
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  timeout: 'Cierre por inactividad',
};

// "Chrome en Windows", "Safari en iOS (móvil) · app instalada"... a partir del user agent
export const describeDevice = (ua = navigator.userAgent) => {
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Navegador';
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad|iPod/.test(ua)
        ? 'iOS'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'sistema desconocido';
  const mobile = /Mobi|Android|iPhone|iPad/.test(ua) ? ' (móvil)' : '';
  const installed = window.matchMedia?.('(display-mode: standalone)').matches ? ' · app instalada' : '';
  return `${browser} en ${os}${mobile}${installed}`;
};

// Nunca interrumpe el inicio o cierre de sesión: si falla (por ejemplo, reglas sin publicar), solo avisa en consola
export async function logAccess(evento) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await addDoc(collection(db, 'accessLogs'), {
      uid: user.uid,
      email: user.email,
      evento,
      dispositivo: describeDevice(),
      ts: serverTimestamp(),
    });
  } catch (error) {
    console.warn('No se pudo registrar el acceso:', error.code || error);
  }
}

// Cierra la sesión dejando constancia (espera como máximo 2 s al registro para no demorar el cierre)
export async function signOutWithLog(evento = 'logout') {
  await Promise.race([logAccess(evento), new Promise((resolve) => setTimeout(resolve, 2000))]);
  await signOut(auth);
}
