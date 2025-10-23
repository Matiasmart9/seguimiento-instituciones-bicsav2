export const getDaysUntil = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString + 'T00:00:00');
  const diffTime = targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getAlertStatus = (dueDate) => {
  if (!dueDate) return { type: 'normal', color: 'green', text: 'Sin fecha' };
  
  const daysUntil = getDaysUntil(dueDate);
  
  if (daysUntil < 0) return { type: 'expired', color: 'red', text: 'Vencida' };
  if (daysUntil <= 5) return { type: 'critical', color: 'orange', text: `Vence en ${daysUntil} días` }; // Cambiado de 2 a 5
  if (daysUntil <= 8) return { type: 'warning', color: 'yellow', text: `Vence en ${daysUntil} días` }; // Cambiado de 5 a 8
  
  return { type: 'normal', color: 'green', text: `Vence el ${new Date(dueDate + 'T00:00:00').toLocaleDateString()}` };
};