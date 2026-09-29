import { useState, useEffect } from 'react';
import { SORT_OPTIONS, DEFAULT_FILTERS } from '../utils/institutionUtils';
import { useDebounce } from '../hooks/useDebounce';
import styled from 'styled-components';

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500 dark:text-gray-400">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500 dark:text-gray-400">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
    <path d="M3 6h18"></path>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 400px;

  .search-wrapper {
    position: relative;
    width: 100%;
  }

  .input-effects {
    position: absolute;
    top: -4px;
    left: -4px;
    width: calc(100% + 8px);
    height: calc(100% + 8px);
    border-radius: 16px;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .glow-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    background: linear-gradient(45deg, #fa8b31, #8b5cf6, #10b981, #fa8b31);
    background-size: 400% 400%;
    animation: gradientShift 4s ease infinite;
    filter: blur(12px);
    opacity: 0.6;
  }

  .border-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    background: linear-gradient(45deg, #fa8b31, #8b5cf6, #10b981);
    background-size: 400% 400%;
    animation: gradientShift 3s ease infinite;
    padding: 2px;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
  }

  .search-input {
    position: relative;
    width: 100%;
    height: 56px;
    background: ${props => props.theme.inputBg};
    border: 1px solid ${props => props.theme.borderColor};
    border-radius: 12px;
    color: ${props => props.theme.textColor};
    padding: 0 50px 0 50px;
    font-size: 16px;
    font-family: inherit;
    z-index: 2;
    transition: all 0.3s ease;

    &::placeholder {
      color: ${props => props.theme.placeholderColor};
    }

    &:focus {
      outline: none;
      background: ${props => props.theme.inputFocusBg};
      border-color: #fa8b31;
      box-shadow: 0 0 0 2px rgba(250, 139, 49, 0.2), 0 0 20px rgba(250, 139, 49, 0.1);
    }
  }

  .search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    color: #fa8b31;
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  &:hover {
    .glow-effect {
      opacity: 0.8;
      filter: blur(14px);
    }
    
    .search-input {
      border-color: #8b5cf6;
    }
  }
`;

// Definimos los temas
const lightTheme = {
  inputBg: '#ffffff',
  inputFocusBg: '#f9fafb',
  borderColor: '#d1d5db',
  textColor: '#1f2937',
  placeholderColor: '#6b7280'
};

const darkTheme = {
  inputBg: '#1f2937',
  inputFocusBg: '#374151',
  borderColor: '#4b5563',
  textColor: '#f9fafb',
  placeholderColor: '#9ca3af'
};

const FilterControls = ({ filters, setFilters, totalCount }) => {
  // El texto se escribe en un estado local y se aplica al filtro tras una pausa (evita filtrar en cada tecla)
  const [searchText, setSearchText] = useState(filters.search);
  const debouncedSearch = useDebounce(searchText, 250);

  useEffect(() => {
    setFilters((prev) => (prev.search === debouncedSearch ? prev : { ...prev, search: debouncedSearch }));
  }, [debouncedSearch, setFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setSearchText('');
    setFilters(DEFAULT_FILTERS);
  };
  // Detectar si está en modo oscuro
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      {/* Buscador con nuevo diseño - adaptable al tema */}
      <SearchContainer theme={isDarkMode ? darkTheme : lightTheme}>
        <div className="search-wrapper">
          <div className="input-effects">
            <div className="glow-effect"></div>
            <div className="border-effect"></div>
          </div>
          
          {/* Ícono de búsqueda */}
          <div className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          {/* Input de búsqueda */}
          <input 
            type="text" 
            name="search" 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)} 
            placeholder="Buscar institución por nombre..." 
            className="search-input"
          />
        </div>
      </SearchContainer>

      {/* Filtros existentes */}
      <div className="flex flex-wrap items-center gap-4 mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Filtros:</h3>
        
        <div className="relative flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 px-3 py-1">
          <FilterIcon />
          <select 
            name="estado" 
            value={filters.estado} 
            onChange={handleFilterChange} 
            className="p-1.5 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white cursor-pointer w-full"
          >
          <option value="Todos">Todos los Estados</option>
          <option value="Validación de XML">Validación de XML</option>
          <option value="Revalidación de XML">Revalidación de XML</option>
          <option value="Activo">Activo</option>
          <option value="Suspendida">Suspendida</option>
          <option value="Vencidas">Vencidas</option>
          <option value="Sin Renovación Contrato">Sin Renovación Contrato</option>
        </select>
        </div>

        <div className="relative flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 px-3 py-1">
          <CategoryIcon />
          <select 
            name="categoria" 
            value={filters.categoria} 
            onChange={handleFilterChange} 
            className="p-1.5 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white cursor-pointer w-full"
          >
          <option value="Todos">Todas las Categorías</option>
          <option value="Premium">Premium</option>
          <option value="MiPymes">MiPymes</option>
          <option value="Premium/Portal-MiPymes">Premium/Portal-MiPymes</option>
        </select>
        </div>
        <div className="relative flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 px-3 py-1">
          <span className="mr-2 text-gray-500 dark:text-gray-400 text-sm">Orden:</span>
          <select
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            className="p-1.5 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white cursor-pointer w-full"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>


        {totalCount !== undefined && (
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 font-semibold text-sm shadow-sm ml-auto">
            <span>Resultados:</span>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md">{totalCount}</span>
          </div>
        )}

        <button 
          onClick={handleClear} 
          className="flex items-center text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-800 px-3 py-2.5 rounded-lg transition-all text-sm font-medium"
        >
          <ClearIcon />
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterControls;