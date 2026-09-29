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

// Texto y nivel de urgencia de los días de vencimiento (null si no aplica al estado)
export const describeDays = (inst) => {
  if (!countsDays(inst)) return null;
  const days = getDaysUntil(inst.fechaVencimiento);
  if (days < 0) return { text: `${Math.abs(days)} días vencidos`, level: 'expired' };
  if (days === 0) return { text: 'Vence hoy', level: 'critical' };
  return { text: `${days} días`, level: days <= 5 ? 'critical' : days <= 8 ? 'warning' : 'ok' };
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
