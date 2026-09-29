const buttonBase =
  'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';

// Devuelve [1, '…', 4, 5, 6, '…', 20] en lugar de listar todas las páginas
function getPageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const items = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push('…');
    items.push(p);
  });
  return items;
}

const PAGE_SIZES = [12, 24, 48];

const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange }) => {
  if (totalItems === 0) return null;

  const first = (currentPage - 1) * pageSize + 1;
  const last = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {first}–{last} de {totalItems}
      </p>

      {totalPages > 1 && (
        <nav className="flex items-center gap-2" aria-label="Paginación">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${buttonBase}`}
          >
            Anterior
          </button>

          <div className="hidden sm:flex gap-1">
            {getPageItems(currentPage, totalPages).map((item, i) =>
              item === '…' ? (
                <span key={`gap-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-500">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => onPageChange(item)}
                  aria-current={currentPage === item ? 'page' : undefined}
                  className={`w-10 h-10 rounded-md font-medium ${
                    currentPage === item ? 'bg-blue-600 text-white' : buttonBase
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <span className="sm:hidden px-2 text-gray-700 dark:text-gray-300 font-medium">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${buttonBase}`}
          >
            Siguiente
          </button>
        </nav>
      )}

      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        Por página
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default Pagination;
