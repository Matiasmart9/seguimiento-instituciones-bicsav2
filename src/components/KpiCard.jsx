import React from 'react';

// Mapeo de colores para cada tipo de KPI - colores vibrantes en ambos modos
const getCardColors = (title) => {
  const colorMap = {
    // Para la primera captura (8 cuadros de instituciones)
    'Total': { 
      border: 'border-l-4 border-blue-500 dark:border-blue-400', 
      text: 'text-blue-600 dark:text-blue-300' 
    },
    'Valid. XML MiPymes': { 
      border: 'border-l-4 border-green-500 dark:border-green-400', 
      text: 'text-green-600 dark:text-green-300' 
    },
    'Valid. xml Premium': { 
      border: 'border-l-4 border-purple-500 dark:border-purple-400', 
      text: 'text-purple-600 dark:text-purple-300' 
    },
    'Valid. Premium/Portal': { 
      border: 'border-l-4 border-indigo-500 dark:border-indigo-400', 
      text: 'text-indigo-600 dark:text-indigo-300' 
    },
    'Revalidacion Inst. Activas': { 
      border: 'border-l-4 border-orange-500 dark:border-orange-400', 
      text: 'text-orange-600 dark:text-orange-300' 
    },
    'Activas': { 
      border: 'border-l-4 border-teal-500 dark:border-teal-400', 
      text: 'text-teal-600 dark:text-teal-300' 
    },
    'Suspendidas': { 
      border: 'border-l-4 border-red-500 dark:border-red-400', 
      text: 'text-red-600 dark:text-red-300' 
    },
    'Vencidas': { 
      border: 'border-l-4 border-yellow-500 dark:border-yellow-400', 
      text: 'text-yellow-600 dark:text-yellow-300' 
    },
    
    // Para la segunda captura (ejemplo con servicios)
    'Su': { 
      border: 'border-l-4 border-blue-500 dark:border-blue-400', 
      text: 'text-blue-600 dark:text-blue-300' 
    },
    'Préstamos': { 
      border: 'border-l-4 border-green-500 dark:border-green-400', 
      text: 'text-green-600 dark:text-green-300' 
    },
    'Telefonia': { 
      border: 'border-l-4 border-purple-500 dark:border-purple-400', 
      text: 'text-purple-600 dark:text-purple-300' 
    },
    'Servicios': { 
      border: 'border-l-4 border-indigo-500 dark:border-indigo-400', 
      text: 'text-indigo-600 dark:text-indigo-300' 
    },
    'Suscripciones': { 
      border: 'border-l-4 border-orange-500 dark:border-orange-400', 
      text: 'text-orange-600 dark:text-orange-300' 
    },
    'Casas Comerciales': { 
      border: 'border-l-4 border-red-500 dark:border-red-400', 
      text: 'text-red-600 dark:text-red-300' 
    }
  };

  return colorMap[title] || { 
    border: 'border-l-4 border-gray-500 dark:border-gray-400', 
    text: 'text-gray-600 dark:text-gray-300' 
  };
};

const KpiCard = ({ title, value, subtitle, onClick }) => {
  const colors = getCardColors(title);

  return (
    <div 
      onClick={onClick}
      className={`
      bg-white dark:bg-gray-800 
      ${colors.border} 
      p-4 rounded-lg shadow-sm 
      flex-1 min-w-[120px] max-w-[140px] 
      border border-gray-200 dark:border-gray-700 
      flex flex-col items-center justify-center text-center h-32
      transition-all duration-300 ease-out
      hover:shadow-xl 
      hover:scale-110
      hover:-translate-y-1
      cursor-pointer
      group
      relative
      overflow-hidden
    `}>
      
      {/* Efecto de brillo sutil al hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      {/* Valor principal grande y centrado */}
      <div className="flex-grow flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
        <p className={`text-3xl font-bold ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
          {value}
        </p>
      </div>
      
      {/* Título centrado debajo del número */}
      <div className="mt-auto w-full transform group-hover:translate-y-1 transition-transform duration-300">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
          {title}
        </p>
        
        {/* Subtítulo opcional (para información adicional) */}
        {subtitle && (
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
            {subtitle}
          </p>
        )}
      </div>
      
    </div>
  );
};

export default KpiCard;