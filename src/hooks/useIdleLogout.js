import { useCallback, useEffect, useRef, useState } from 'react';

// Cierre de sesión automático por inactividad
export const IDLE_TIMEOUT_MINUTES = 15;
export const IDLE_WARNING_SECONDS = 60;

export const ACTIVITY_KEY = 'bicsa_last_activity';
export const IDLE_FLAG_KEY = 'bicsa_idle_logout';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'wheel', 'touchstart', 'click'];

const readStored = () => {
  try {
    return Number(localStorage.getItem(ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeStored = (value) => {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(value));
  } catch {
    // sin almacenamiento disponible: se usa solo la memoria de esta pestaña
  }
};

// Devuelve los segundos que faltan cuando se acerca el cierre (null si no hay aviso) y `stay` para seguir conectado.
// La última actividad se comparte entre pestañas mediante localStorage: usar cualquiera de ellas mantiene la sesión.
export function useIdleLogout({
  enabled,
  onTimeout,
  timeoutMs = IDLE_TIMEOUT_MINUTES * 60 * 1000,
  warningMs = IDLE_WARNING_SECONDS * 1000,
}) {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const lastActivity = useRef(0);
  const warningVisible = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  const markActive = useCallback(() => {
    const now = Date.now();
    lastActivity.current = now;
    writeStored(now);
    warningVisible.current = false;
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Al iniciar sesión (o activar el control) se parte de "activo ahora"
    lastActivity.current = Date.now();
    writeStored(lastActivity.current);

    // Actividad "pasiva" (mouse, teclado...): con el aviso visible solo cuenta el botón "Seguir conectado"
    const onActivity = () => {
      if (warningVisible.current) return;
      const now = Date.now();
      if (now - lastActivity.current < 1000) return;
      lastActivity.current = now;
      writeStored(now);
    };

    let expired = false;
    const tick = () => {
      if (expired) return;
      const idle = Date.now() - Math.max(lastActivity.current, readStored());

      if (idle >= timeoutMs) {
        expired = true;
        try {
          localStorage.setItem(IDLE_FLAG_KEY, '1');
        } catch {
          // no pasa nada
        }
        warningVisible.current = false;
        setSecondsLeft(null);
        onTimeoutRef.current();
      } else if (idle >= timeoutMs - warningMs) {
        warningVisible.current = true;
        setSecondsLeft(Math.ceil((timeoutMs - idle) / 1000));
      } else if (warningVisible.current) {
        // otra pestaña tuvo actividad
        warningVisible.current = false;
        setSecondsLeft(null);
      }
    };

    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', tick); // al volver a la pestaña (o tras suspender el equipo) se revisa al instante
    const id = setInterval(tick, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity));
      document.removeEventListener('visibilitychange', tick);
      clearInterval(id);
      warningVisible.current = false;
    };
  }, [enabled, timeoutMs, warningMs, markActive]);

  return { secondsLeft: enabled ? secondsLeft : null, stay: markActive };
}
