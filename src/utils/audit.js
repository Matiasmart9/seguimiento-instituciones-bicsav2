import { stripFormatting } from './richText';

// Cada movimiento se guarda dentro del propio documento de la institución, en el arreglo `historial`.
// Así funciona con las reglas actuales de Firestore, sin colecciones nuevas.
export const AUDIT_ACTIONS = {
  institucion_creada: { label: 'Institución creada', color: 'green' },
  estado_cambiado: { label: 'Cambio de estado', color: 'blue' },
  institucion_editada: { label: 'Datos editados', color: 'yellow' },
  comentario_agregado: { label: 'Comentario agregado', color: 'purple' },
  comentario_eliminado: { label: 'Comentario eliminado', color: 'red' },
};

const TRACKED_FIELDS = [
  ['nombre', 'Nombre'],
  ['categoria', 'Categoría'],
  ['fechaIngreso', 'Fecha de ingreso'],
  ['fechaVencimiento', 'Fecha de vencimiento'],
  ['motivoSuspension', 'Motivo de suspensión'],
];

const shorten = (text, max = 140) => (text.length > max ? `${text.slice(0, max)}…` : text);
const show = (value) => (value === undefined || value === null || value === '' ? '(vacío)' : value);

export const buildEntry = (user, accion, detalle) => ({
  fecha: new Date().toISOString(),
  usuario: user.email,
  accion,
  detalle,
});

export const commentPreview = (comment) => shorten(stripFormatting(comment.texto || ''));

// Compara la institución guardada con los datos nuevos y devuelve las entradas a registrar
export const diffInstitution = (user, previous, next) => {
  const entries = [];

  if (previous.estado !== next.estado) {
    entries.push(buildEntry(user, 'estado_cambiado', `${show(previous.estado)} → ${show(next.estado)}`));
  }

  const changes = TRACKED_FIELDS.filter(([key]) => (previous[key] || '') !== (next[key] || '')).map(
    ([key, label]) => `${label}: ${show(previous[key])} → ${show(next[key])}`
  );
  if (changes.length > 0) {
    entries.push(buildEntry(user, 'institucion_editada', changes.join(' · ')));
  }

  return entries;
};

// Movimientos a mostrar, del más reciente al más antiguo. Los comentarios anteriores a la
// auditoría (que no dejaron entrada en `historial`) se incluyen para que el registro no empiece vacío.
export const buildTimeline = (institution) => {
  const logged = institution.historial || [];
  const cutoff = logged.length > 0 ? logged.reduce((min, e) => (e.fecha < min ? e.fecha : min), logged[0].fecha) : null;
  const isLegacy = (fecha) => !cutoff || fecha < cutoff;

  const legacy = (institution.comentarios || [])
    .filter((c) => isLegacy(c.fecha))
    .map((c) => ({ fecha: c.fecha, usuario: c.autor, accion: 'comentario_agregado', detalle: commentPreview(c), legacy: true }));

  if (institution.fechaCreacion && institution.creadoPor && isLegacy(institution.fechaCreacion) && !logged.some((e) => e.accion === 'institucion_creada')) {
    legacy.push({ fecha: institution.fechaCreacion, usuario: institution.creadoPor, accion: 'institucion_creada', detalle: 'Registro creado', legacy: true });
  }

  return [...logged, ...legacy].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
};
