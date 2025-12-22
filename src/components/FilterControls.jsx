import React from 'react';
import styled from 'styled-components';

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

const FilterControls = ({ filters, setFilters }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
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
            value={filters.search || ''} 
            onChange={handleFilterChange} 
            placeholder="Buscar institución por nombre..." 
            className="search-input"
          />
        </div>
      </SearchContainer>

      {/* Filtros existentes */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
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
          <option value="Vencidas">Vencidas</option>
        </select>
        <select 
          name="categoria" 
          value={filters.categoria} 
          onChange={handleFilterChange} 
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="Todos">Todas las Categorías</option>
          <option value="Premium">Premium</option>
          <option value="MiPymes">MiPymes</option>
          <option value="Premium/Portal-MiPymes">Premium/Portal-MiPymes</option>
        </select>
        <button 
          onClick={() => setFilters({ estado: 'Todos', categoria: 'Todos', search: '' })} 
          className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterControls;