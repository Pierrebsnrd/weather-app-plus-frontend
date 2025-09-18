import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('weather-app-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Rediriger seulement si on était connecté avant et qu'on a une erreur 401
    if (error.response?.status === 401 && localStorage.getItem('weather-app-token')) {
      localStorage.removeItem('weather-app-token');
      localStorage.removeItem('weather-app-user');
      // Ne rediriger que si on n'est pas déjà sur une page d'auth
      if (!window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// === AUTHENTICATION ===
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/api/auth/verify');
    return response.data;
  },

  mergeCities: async (cities) => {
    const response = await api.post('/api/auth/merge-cities', { cities });
    return response.data;
  },
};

// === WEATHER ===
export const weatherAPI = {
  searchCity: async (cityName) => {
    const response = await api.get(`/api/weather/search/${encodeURIComponent(cityName)}`);
    return response.data;
  },

  getCurrentWeather: async (lat, lon) => {
    const response = await api.get(`/api/weather/current/${lat}/${lon}`);
    return response.data;
  },

  getForecast: async (lat, lon) => {
    const response = await api.get(`/api/weather/forecast/${lat}/${lon}`);
    return response.data;
  },
};

// === CITIES (User favorites) ===
export const citiesAPI = {
  getUserCities: async () => {
    const response = await api.get('/api/cities');
    return response.data;
  },

  addCity: async (cityData) => {
    const response = await api.post('/api/cities', cityData);
    return response.data;
  },

  removeCity: async (cityId) => {
    const response = await api.delete(`/api/cities/${cityId}`);
    return response.data;
  },
};

export default api;