import React from 'react';

const KpiCard = ({ title, value, color, icon }) => (
  <div className="bg-white p-3 rounded-lg shadow-sm text-center flex-1 min-w-[100px] max-w-[120px] border hover:shadow-md transition-all duration-200 hover:scale-105">
    {icon && <div className="text-lg mb-1" style={{ color }}>{icon}</div>}
    <p className="text-xl font-bold mb-1" style={{ color }}>{value}</p>
    <p className="text-xs text-gray-600 font-medium leading-tight px-1">{title}</p>
  </div>
);

export default KpiCard;