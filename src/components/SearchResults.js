import { MapPin, Plus } from 'lucide-react';

const SearchResults = ({ cities, onSelectCity, loading = false }) => {
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto mt-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center p-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cities || cities.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <div className="p-3 bg-gray-50/80">
          <h3 className="text-sm font-medium text-gray-700">
            Résultats de recherche ({cities.length})
          </h3>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {cities.map((city, index) => (
            <button
              key={`${city.lat}-${city.lon}-${index}`}
              onClick={() => onSelectCity(city)}
              className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800 truncate">
                      {city.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {city.state ? `${city.state}, ` : ''}{city.country}
                    </div>
                  </div>
                </div>

                <div className="flex items-center ml-2">
                  <Plus className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 bg-gray-50/80">
          <p className="text-xs text-gray-500 text-center">
            Cliquez sur une ville pour l'ajouter à votre dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;