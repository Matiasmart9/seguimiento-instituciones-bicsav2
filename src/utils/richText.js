// Formato mínimo para comentarios: **negrita**, *cursiva* y ***negrita y cursiva***.
// Se guarda como texto plano, así los comentarios existentes siguen funcionando.
export const FORMAT_PATTERN = /(\*\*\*[^*\n]+?\*\*\*|\*\*[^*\n]+?\*\*|\*[^*\n]+?\*)/g;

export const stripFormatting = (text = '') =>
  text
    .replace(/\*\*\*([^*\n]+?)\*\*\*/g, '$1')
    .replace(/\*\*([^*\n]+?)\*\*/g, '$1')
    .replace(/\*([^*\n]+?)\*/g, '$1');

// Cuenta asteriscos consecutivos al final de `str` (fromEnd) o al inicio.
const countStars = (str, fromEnd) => {
  let n = 0;
  while (n < str.length && str[fromEnd ? str.length - 1 - n : n] === '*') n++;
  return n;
};

// Activa o desactiva `marker` ('*' cursiva, '**' negrita) alrededor de la selección.
// Los asteriscos vecinos indican el formato actual: 1 = cursiva, 2 = negrita, 3 = ambos.
// Devuelve el texto nuevo y el rango a seleccionar después.
export const toggleWrap = (value, start, end, marker) => {
  const len = marker.length;
  const before = value.slice(0, start);
  const selected = value.slice(start, end);
  const after = value.slice(end);

  const around = Math.min(countStars(before, true), countStars(after, false));
  const active = marker === '**' ? around >= 2 : around === 1 || around === 3;

  if (active) {
    return {
      value: before.slice(0, -len) + selected + after.slice(len),
      start: start - len,
      end: end - len,
    };
  }
  return {
    value: before + marker + selected + marker + after,
    start: start + len,
    end: end + len,
  };
};
