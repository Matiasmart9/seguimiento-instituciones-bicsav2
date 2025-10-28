import React from 'react';

const FilterControls = ({ filters, setFilters }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      {/* Buscador */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            name="search" 
            value={filters.search || ''} 
            onChange={handleFilterChange} 
            placeholder="Buscar institución por nombre..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Filtros:</h3>
        <select 
          name="estado" 
          value={filters.estado} 
          onChange={handleFilterChange} 
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="Todos">Todos los Estados</option>
          <option value="Validación de XML">Validación de XML</option>
          <option value="Revalidación de XML">Revalidación de XML</option>
          <option value="Activo">Activo</option>
          <option value="Suspendida">Suspendida</option>
        </select>
        <select 
          name="categoria" 
          value={filters.categoria} 
          onChange={handleFilterChange} 
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Todos">Todas las Categorías</option>
          <option value="Premium">Premium</option>
          <option value="MiPymes">MiPymes</option>
        </select>
        <button 
          onClick={() => setFilters({ estado: 'Todos', categoria: 'Todos', search: '' })} 
          className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterControls;