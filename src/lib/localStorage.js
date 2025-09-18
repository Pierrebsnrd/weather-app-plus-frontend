// Gestion du stockage local pour les utilisateurs non connectés

const STORAGE_KEYS = {
  CITIES: 'weather-app-cities',
  USER: 'weather-app-user',
  TOKEN: 'weather-app-token'
};

// === GESTION DES VILLES (LocalStorage) ===
export const localStorageCities = {
  // Récupérer toutes les villes stockées localement
  getCities: () => {
    try {
      const cities = localStorage.getItem(STORAGE_KEYS.CITIES);
      return cities ? JSON.parse(cities) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des villes locales:', error);
      return [];
    }
  },

  // Ajouter une ville au stockage local
  addCity: (cityData) => {
    try {
      const cities = localStorageCities.getCities();

      // Vérifier si la ville existe déjà (basé sur les coordonnées)
      const existingCity = cities.find(city =>
        city.lat === cityData.lat && city.lon === cityData.lon
      );

      if (existingCity) {
        return { success: false, message: 'Cette ville est déjà dans votre liste' };
      }

      // Ajouter la ville avec un timestamp
      const newCity = {
        ...cityData,
        id: `local_${Date.now()}`,
        addedAt: new Date().toISOString()
      };

      cities.push(newCity);
      localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));

      return { success: true, cities };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la ville:', error);
      return { success: false, message: 'Erreur lors de l\'ajout de la ville' };
    }
  },

  // Supprimer une ville du stockage local
  removeCity: (cityId) => {
    try {
      const cities = localStorageCities.getCities();
      const filteredCities = cities.filter(city => city.id !== cityId);

      localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(filteredCities));

      return { success: true, cities: filteredCities };
    } catch (error) {
      console.error('Erreur lors de la suppression de la ville:', error);
      return { success: false, message: 'Erreur lors de la suppression de la ville' };
    }
  },

  // Vider toutes les villes (utile après connexion/fusion)
  clearCities: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CITIES);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors du vidage des villes locales:', error);
      return { success: false };
    }
  },

  // Obtenir les villes au format compatible avec l'API
  getCitiesForMerging: () => {
    const cities = localStorageCities.getCities();
    return cities.map(city => ({
      name: city.name,
      country: city.country,
      lat: city.lat,
      lon: city.lon
    }));
  }
};

// === GESTION DE L'AUTHENTIFICATION (LocalStorage) ===
export const localStorageAuth = {
  // Sauvegarder le token JWT
  setToken: (token) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
      return false;
    }
  },

  // Récupérer le token JWT
  getToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  },

  // Supprimer le token JWT
  removeToken: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
      return false;
    }
  },

  // Sauvegarder les informations utilisateur
  setUser: (user) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
      return false;
    }
  },

  // Récupérer les informations utilisateur
  getUser: () => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  // Supprimer les informations utilisateur
  removeUser: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return false;
    }
  },

  // Déconnexion complète
  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return false;
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorageAuth.getToken();
    const user = localStorageAuth.getUser();
    return !!(token && user);
  }
};

// === UTILITAIRES ===
export const localStorageUtils = {
  // Vérifier si le localStorage est disponible
  isAvailable: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Obtenir la taille utilisée par notre application
  getStorageSize: () => {
    try {
      let totalSize = 0;

      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });

      return {
        bytes: totalSize,
        kb: (totalSize / 1024).toFixed(2),
        mb: (totalSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error('Erreur lors du calcul de la taille du stockage:', error);
      return { bytes: 0, kb: 0, mb: 0 };
    }
  },

  // Vider tout le stockage de l'application
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Erreur lors du vidage complet:', error);
      return false;
    }
  }
};