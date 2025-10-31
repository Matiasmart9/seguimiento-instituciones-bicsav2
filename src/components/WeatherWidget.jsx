// components/WeatherWidget.jsx - Versión con bordes redondeados
import React, { useState, useEffect } from 'react';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = '3bc0a08cc66eb64e7688199bdbb42ffe';
  const CITY = 'Asuncion,PY';

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🌤️ Obteniendo datos del clima desde OpenWeather...');
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=es`
        );
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setWeather({
          name: data.name,
          main: { 
            temp: data.main.temp,
            feels_like: data.main.feels_like
          },
          weather: data.weather[0]
        });
        
        console.log('✅ Clima real cargado desde OpenWeather');
        
      } catch (err) {
        console.error('❌ Error cargando clima:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Actualizar cada hora
    const interval = setInterval(fetchWeather, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [API_KEY, CITY]);

  const getWeatherEmoji = (weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return '⛈️'; // Tormenta
    if (weatherId >= 300 && weatherId < 500) return '🌧️'; // Llovizna/Lluvia ligera
    if (weatherId >= 500 && weatherId < 600) return '🌧️'; // Lluvia
    if (weatherId >= 600 && weatherId < 700) return '❄️';  // Nieve
    if (weatherId >= 700 && weatherId < 800) return '🌫️'; // Atmosférico
    if (weatherId === 800) return '☀️';                   // Despejado
    if (weatherId > 800) return '☁️';                     // Nublado
    return '🌈';
  };

  if (loading) {
    return (
      <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-48 h-16 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Cargando clima...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-48 h-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs text-red-500 dark:text-red-400">Error clima</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Intente más tarde</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-48 h-16 flex items-center justify-center">
      <div className="flex items-center justify-center w-full px-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {getWeatherEmoji(weather?.weather?.id)}
          </span>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
              {Math.round(weather?.main?.temp)}°C
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight capitalize">
              {weather?.weather?.description}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {weather?.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;