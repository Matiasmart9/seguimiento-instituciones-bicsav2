export const ESTADO_VALIDACION = 'Validación de XML';
export const ESTADO_REVALIDACION = 'Revalidación de XML';
export const ESTADO_ACTIVO = 'Activo';
export const ESTADO_SUSPENDIDA = 'Suspendida';
export const ESTADO_SIN_RENOVACION = 'Sin Renovación Contrato';

export const DEFAULT_FILTERS = { estado: 'Todos', categoria: 'Todos', search: '', sort: 'ingreso-desc' };

export const SORT_OPTIONS = [
  { value: 'ingreso-desc', label: 'Más recientes' },
  { value: 'ingreso-asc', label: 'Más antiguas' },
  { value: 'vencimiento-asc', label: 'Vencimiento más próximo' },
  { value: 'nombre-asc', label: 'Nombre (A-Z)' },
  { value: 'nombre-desc', label: 'Nombre (Z-A)' },
];

// Minúsculas y sin tildes, para que "validacion" encuentre "Validación"
export const normalizeText = (text) =>
  (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const isExpired = (inst, today = getToday()) => {
  if (!inst.fechaVencimiento) return false;
  if (inst.estado !== ESTADO_VALIDACION && inst.estado !== ESTADO_REVALIDACION) return false;
  return new Date(inst.fechaVencimiento + 'T00:00:00') < today;
};

// Los días de vencimiento/atraso solo corren mientras la institución está en validación.
// Activo, Suspendida y Sin Renovación Contrato no acumulan atraso.
export const countsDays = (inst) =>
  Boolean(inst.fechaVencimiento) && (inst.estado === ESTADO_VALIDACION || inst.estado === ESTADO_REVALIDACION);

const compareDates =(a, b) => {
  if (!a && !b) return 0;
  if (!a) return 1; // sin fecha siempre al final
  if (!b) return -1;
  return a < b ? -1 : a > b ? 1 : 0;
};

const SORTERS = {
  'ingreso-desc': (a, b) => compareDates(b.fechaIngreso, a.fechaIngreso),
  'ingreso-asc': (a, b) => compareDates(a.fechaIngreso, b.fechaIngreso),
  'vencimiento-asc': (a, b) => compareDates(a.fechaVencimiento, b.fechaVencimiento),
  'nombre-asc': (a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
  'nombre-desc': (a, b) => (b.nombre || '').localeCompare(a.nombre || '', 'es', { sensitivity: 'base' }),
};

export const filterInstitutions = (institutions, filters) => {
  const today = getToday();
  const query = normalizeText(filters.search);

  const result = institutions.filter((inst) => {
    const estadoMatch =
      filters.estado === 'Todos' ||
      (filters.estado === 'Vencidas' ? isExpired(inst, today) : inst.estado === filters.estado);
    const categoriaMatch = filters.categoria === 'Todos' || inst.categoria === filters.categoria;
    const searchMatch = !query || normalizeText(inst.nombre).includes(query);
    return estadoMatch && categoriaMatch && searchMatch;
  });

  const sorter = SORTERS[filters.sort];
  return sorter ? result.sort(sorter) : result;
};

export const computeKpis = (institutions) => {
  const today = getToday();
  const kpis = {
    total: [],
    validacionMipymes: [],
    validacionPremium: [],
    validacionPremiumPortal: [],
    revalidacion: [],
    activas: [],
    suspended: [],
    expired: [],
    sinRenovacion: [],
  };

  for (const inst of institutions) {
    if (inst.estado !== ESTADO_ACTIVO && inst.estado !== ESTADO_SUSPENDIDA) kpis.total.push(inst);
    if (isExpired(inst, today)) kpis.expired.push(inst);

    switch (inst.estado) {
      case ESTADO_VALIDACION:
        if (inst.categoria === 'MiPymes') kpis.validacionMipymes.push(inst);
        else if (inst.categoria === 'Premium') kpis.validacionPremium.push(inst);
        else if (inst.categoria === 'Premium/Portal-MiPymes') kpis.validacionPremiumPortal.push(inst);
        break;
      case ESTADO_REVALIDACION:
        kpis.revalidacion.push(inst);
        break;
      case ESTADO_ACTIVO:
        kpis.activas.push(inst);
        break;
      case ESTADO_SUSPENDIDA:
        kpis.suspended.push(inst);
        break;
      case ESTADO_SIN_RENOVACION:
        kpis.sinRenovacion.push(inst);
        break;
    }
  }

  return kpis;
};
