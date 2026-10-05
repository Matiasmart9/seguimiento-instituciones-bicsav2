import { getDaysUntil, formatDateTime } from './dateUtils';
import { stripFormatting } from './richText';
import { getLastComment as getLatestComment, describeDays } from './report';
import {
  ESTADO_VALIDACION,
  ESTADO_REVALIDACION,
  ESTADO_ACTIVO,
  ESTADO_SUSPENDIDA,
  ESTADO_SIN_RENOVACION,
  isExpired,
  countsDays,
} from './institutionUtils';

// exceljs pesa bastante: se carga solo cuando el usuario exporta
const loadExcelJS = async () => (await import('exceljs')).default;

// Colores de los títulos por hoja (mismos tonos que las tarjetas de KPI)
const COLORS = {
  Resumen: '1D4ED8',
  MiPymes: '16A34A',
  Premium: '059669',
  'Premium-Portal': '7C3AED',
  Activas: '10B981',
  'Revalidación': 'CA8A04',
  Suspendidas: 'D97706',
  Vencidas: 'DC2626',
  'Sin Renovación': '6B7280',
  Detalle: 'EA580C',
};

const formatDate = (dateString) =>
  dateString ? new Date(dateString + 'T00:00:00').toLocaleDateString('es-PY') : 'N/A';

const getDaysText = (inst) => {
  if (!countsDays(inst)) return 'N/A';
  const days = getDaysUntil(inst.fechaVencimiento);
  return days < 0 ? `${Math.abs(days)} días vencidos` : `${days} días`;
};

const getLastComment = (inst) => {
  if (!inst.comentarios || inst.comentarios.length === 0) return 'Sin comentarios';
  const last = inst.comentarios[inst.comentarios.length - 1];
  return `${stripFormatting(last.texto)} - Por ${last.autor} (${formatDateTime(last.fecha)})`;
};

const prepareInstitutionData = (inst) => ({
  'Institución': inst.nombre,
  'Categoría': inst.categoria,
  'Estado': inst.estado,
  'Fecha de Ingreso': formatDate(inst.fechaIngreso),
  'Fecha de Vencimiento': formatDate(inst.fechaVencimiento),
  'Días hasta Vencimiento': getDaysText(inst),
  'Motivo Suspensión': inst.motivoSuspension || 'N/A',
  'Último Comentario': getLastComment(inst),
});

const dateStamp = () => new Date().toLocaleDateString('es-PY').replace(/\//g, '-');

const THIN = { style: 'thin', color: { argb: 'FFD1D5DB' } };
const BORDER = { top: THIN, left: THIN, bottom: THIN, right: THIN };

// Crea una hoja con títulos en color (texto blanco en negrita sobre fondo de color), filtros y fila fija
const addSheet = (workbook, name, rows, color) => {
  const ws = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
  const headers = Object.keys(rows[0]);

  ws.columns = headers.map((header) => {
    const longest = Math.max(header.length, ...rows.map((r) => String(r[header] ?? '').length));
    return { header, key: header, width: Math.min(Math.max(longest + 3, 14), 60) };
  });
  rows.forEach((row) => ws.addRow(row));

  const headerRow = ws.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${color || COLORS[name] || '1D4ED8'}` } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = BORDER;
  });

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.border = BORDER;
      cell.alignment = { vertical: 'top', wrapText: true };
    });
  });

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
  return ws;
};

const download = async (workbook, fileName) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export async function exportAllToExcel(institutions) {
  const ExcelJS = await loadExcelJS();
  const byState = (estado, categoria) =>
    institutions.filter((i) => i.estado === estado && (!categoria || i.categoria === categoria));

  const sheets = [
    ['MiPymes', byState(ESTADO_VALIDACION, 'MiPymes')],
    ['Premium', byState(ESTADO_VALIDACION, 'Premium')],
    ['Premium-Portal', byState(ESTADO_VALIDACION, 'Premium/Portal-MiPymes')],
    ['Activas', byState(ESTADO_ACTIVO)],
    ['Revalidación', byState(ESTADO_REVALIDACION)],
    ['Suspendidas', byState(ESTADO_SUSPENDIDA)],
    ['Vencidas', institutions.filter((i) => isExpired(i))],
    ['Sin Renovación', byState(ESTADO_SIN_RENOVACION)],
  ];

  const vencidas = sheets.find(([name]) => name === 'Vencidas')[1];
  const resumen = [
    { 'Métrica': 'Total de Instituciones', 'Cantidad': institutions.length + vencidas.length },
    { 'Métrica': 'Validación XML MiPymes', 'Cantidad': sheets[0][1].length },
    { 'Métrica': 'Validación XML Premium', 'Cantidad': sheets[1][1].length },
    { 'Métrica': 'Validación Premium/Portal-MiPymes', 'Cantidad': sheets[2][1].length },
    { 'Métrica': 'Revalidación Inst. Activas', 'Cantidad': sheets[4][1].length },
    { 'Métrica': 'Activas', 'Cantidad': sheets[3][1].length },
    { 'Métrica': 'Suspendidas', 'Cantidad': sheets[5][1].length },
    { 'Métrica': 'Vencidas', 'Cantidad': vencidas.length },
    { 'Métrica': 'Sin Renovación Contrato', 'Cantidad': sheets[7][1].length },
  ];

  const wb = new ExcelJS.Workbook();
  addSheet(wb, 'Resumen', resumen);
  for (const [name, rows] of sheets) {
    if (rows.length > 0) addSheet(wb, name, rows.map(prepareInstitutionData));
  }

  await download(wb, `Instituciones_${dateStamp()}.xlsx`);
}

// Reporte comercial: una hoja por grupo con el último comentario de cada institución
export async function exportReportToExcel(groups) {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();

  for (const group of groups) {
    const rows = group.items.map((inst) => {
      const last = getLatestComment(inst);
      return {
        'Institución': inst.nombre,
        'Categoría': inst.categoria,
        'Estado': inst.estado,
        'Fecha de Ingreso': formatDate(inst.fechaIngreso),
        'Fecha de Vencimiento': formatDate(inst.fechaVencimiento),
        '60 Días Plazo': describeDays(inst)?.text ?? 'N/A',
        'Último Comentario': last ? stripFormatting(last.texto) : 'Sin comentarios',
        'Comentado por': last ? last.autor : 'N/A',
        'Fecha del Comentario': last ? formatDateTime(last.fecha) : 'N/A',
      };
    });
    const sheetName = group.title.replace(/[/\\?*[\]:]/g, '-').slice(0, 31);
    addSheet(wb, sheetName, rows, group.color.replace('#', ''));
  }

  await download(wb, `Reporte_Instituciones_${dateStamp()}.xlsx`);
}

export async function exportDetailToExcel(title, institutions) {
  const ExcelJS = await loadExcelJS();
  const data = institutions.map((inst) => ({
    'Institución': inst.nombre,
    'Categoría': inst.categoria,
    'Estado': inst.estado,
    'Fecha Vencimiento': formatDate(inst.fechaVencimiento),
    'Días Restantes/Vencidos': getDaysText(inst),
  }));

  const wb = new ExcelJS.Workbook();
  if (data.length > 0) addSheet(wb, 'Detalle', data);
  else wb.addWorksheet('Detalle');

  const safeTitle = title.replace(/[/\\]/g, '-');
  await download(wb, `Detalle_${safeTitle}_${dateStamp()}.xlsx`);
}
