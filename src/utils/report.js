import { getDaysUntil } from './dateUtils';
import { computeKpis, countsDays, normalizeText } from './institutionUtils';
import { stripFormatting } from './richText';

// Grupos que ve el área comercial (mismos nombres y colores que las tarjetas de KPI)
export const REPORT_GROUPS = [
  { key: 'validacionMipymes', title: 'Valid. XML MiPymes', color: '#16A34A' },
  { key: 'validacionPremium', title: 'Valid. XML Premium', color: '#059669' },
  { key: 'validacionPremiumPortal', title: 'Valid. Premium/Portal-MiPymes', color: '#0E9AA7' },
  { key: 'revalidacion', title: 'Revalidación Inst. Activas', color: '#CA8A04' },
  { key: 'suspended', title: 'Suspendidas', color: '#D97706' },
];

// Último comentario por fecha (no depende del orden en que estén guardados)
export const getLastComment = (inst) => {
  const comments = inst.comentarios || [];
  if (comments.length === 0) return null;
  return comments.reduce((latest, c) => (c.fecha > latest.fecha ? c : latest), comments[0]);
};

export const daysSince = (isoDate) => {
  const then = new Date(isoDate);
  then.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today - then) / 86400000);
};

// Plazo que se otorga a la institución para entregar el XML
export const PLAZO_DIAS = 60;

const pad2 = (n) => String(n).padStart(2, '0');

// Avance del plazo de 60 días (null si no aplica al estado). El plazo termina en la fecha de vencimiento:
// - dentro del plazo: "06 Días de 60 Días" (el día 60 es el del vencimiento)
// - pasado el plazo: "01 días vencidos"
// `progress` (0-100) alimenta la barra de avance.
export const describeDays = (inst) => {
  if (!countsDays(inst)) return null;
  const left = getDaysUntil(inst.fechaVencimiento);

  if (left < 0) return { text: `${pad2(Math.abs(left))} días vencidos`, level: 'expired', progress: 100 };

  const elapsed = Math.min(Math.max(PLAZO_DIAS - left, 0), PLAZO_DIAS);
  return {
    text: `${pad2(elapsed)} Días de ${PLAZO_DIAS} Días`,
    level: left <= 5 ? 'critical' : left <= 8 ? 'warning' : 'ok',
    progress: Math.round((elapsed / PLAZO_DIAS) * 100),
  };
};

// Vencidas primero (más atrasadas arriba), luego por nombre
const byUrgency = (a, b) => {
  const da = countsDays(a) ? getDaysUntil(a.fechaVencimiento) : Infinity;
  const db = countsDays(b) ? getDaysUntil(b.fechaVencimiento) : Infinity;
  if (da !== db) return da - db;
  return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
};

// Devuelve los grupos con sus instituciones ya filtradas por búsqueda y grupo
export const buildReport = (institutions, { group = 'todos', search = '', onlyOverdue = false } = {}) => {
  const kpis = computeKpis(institutions);
  const query = normalizeText(search);

  return REPORT_GROUPS.filter((g) => group === 'todos' || group === g.key).map((g) => {
    const items = kpis[g.key]
      .filter((inst) => !query || normalizeText(inst.nombre).includes(query) || normalizeText(stripFormatting(getLastComment(inst)?.texto)).includes(query))
      .filter((inst) => !onlyOverdue || describeDays(inst)?.level === 'expired')
      .sort(byUrgency);
    return { ...g, items };
  });
};
