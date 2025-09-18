import { useState, useEffect } from 'react';
import { Heart, HeartOff, MapPin, Thermometer, Eye, Wind, Droplets } from 'lucide-react';
import { weatherAPI } from '../lib/api';
import { localStorageCities } from '../lib/localStorage';

const WeatherCard = ({
  city,
  onToggleFavorite,
  isFavorite = false,
  showFavoriteButton = true,
  isAuthenticated = false
}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await weatherAPI.getCurrentWeather(city.lat, city.lon);
        setWeatherData(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des données météo:', err);
        setError('Impossible de récupérer les données météo');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city.lat, city.lon]);

  const handleFavoriteToggle = () => {
    if (onToggleFavorite) {
      onToggleFavorite(city);
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatTemperature = (temp) => {
    return `${Math.round(temp)}°C`;
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  if (loading) {
    return (
      <div className="weather-card p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-300 rounded w-32"></div>
          {showFavoriteButton && (
            <div className="h-6 w-6 bg-gray-300 rounded"></div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="h-16 w-16 bg-gray-300 rounded"></div>
          <div className="text-right">
            <div className="h-12 bg-gray-300 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-card p-6 border-red-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-gray-500 mr-1" />
            <h3 className="font-semibold text-gray-800">
              {city.name}, {city.country}
            </h3>
          </div>
          {showFavoriteButton && (
            <button
              onClick={handleFavoriteToggle}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              {isFavorite ? (
                <Heart className="h-5 w-5 fill-current text-red-500" />
              ) : (
                <HeartOff className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        <div className="text-center text-red-500 py-8">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="weather-card p-6 animate-fadeInUp">
      {/* En-tête avec le nom de la ville et bouton favori */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-500 mr-1" />
          <h3 className="font-semibold text-gray-800">
            {weatherData.location.name}, {weatherData.location.country}
          </h3>
        </div>
        {showFavoriteButton && (
          <button
            onClick={handleFavoriteToggle}
            className="text-gray-400 hover:text-red-500 transition-colors z-10 relative p-1 rounded-full hover:bg-white/10"
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            {isFavorite ? (
              <Heart className="h-5 w-5 fill-current text-red-500" />
            ) : (
              <HeartOff className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Température principale et icône */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img
            src={getWeatherIcon(weatherData.current.icon)}
            alt={weatherData.current.description}
            className="weather-icon"
          />
          <div className="ml-3">
            <div className="text-3xl font-bold text-gray-800">
              {formatTemperature(weatherData.current.temperature)}
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {weatherData.current.description}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">
            Ressenti
          </div>
          <div className="text-lg font-medium text-gray-700">
            {formatTemperature(weatherData.current.feelsLike)}
          </div>
        </div>
      </div>

      {/* Détails météo */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <Droplets className="h-4 w-4 text-blue-500 mr-2" />
          <span className="text-gray-600">Humidité:</span>
          <span className="ml-1 font-medium">{weatherData.current.humidity}%</span>
        </div>

        <div className="flex items-center">
          <Wind className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-gray-600">Vent:</span>
          <span className="ml-1 font-medium">
            {weatherData.current.windSpeed} km/h {getWindDirection(weatherData.current.windDirection)}
          </span>
        </div>

        <div className="flex items-center">
          <Thermometer className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-gray-600">Pression:</span>
          <span className="ml-1 font-medium">{weatherData.current.pressure} hPa</span>
        </div>

        {weatherData.current.visibility && (
          <div className="flex items-center">
            <Eye className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-gray-600">Visibilité:</span>
            <span className="ml-1 font-medium">{weatherData.current.visibility} km</span>
          </div>
        )}
      </div>

      {/* Horodatage */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Dernière mise à jour: {new Date(weatherData.timestamp).toLocaleString('fr-FR')}
        </p>
      </div>
    </div>
  );
};

export default WeatherCard;