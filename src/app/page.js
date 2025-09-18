'use client';

import { useState, useEffect } from 'react';
import { Cloud, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import WeatherCard from '../components/WeatherCard';
import { weatherAPI, citiesAPI } from '../lib/api';
import { localStorageCities, localStorageAuth } from '../lib/localStorage';

/**
 * Page d'accueil de WeatherApp+
 *
 * Fonctionnalités principales :
 * - Recherche de villes via l'API OpenWeatherMap
 * - Affichage des données météo en temps réel
 * - Gestion des favoris (localStorage pour invités, API pour utilisateurs connectés)
 * - Authentification et synchronisation des données
 * - Interface responsive avec notifications
 */
export default function Home() {
  // ===== ÉTATS LOCAUX =====

  /** @type {Array} Résultats de la recherche de villes */
  const [searchResults, setSearchResults] = useState([]);

  /** @type {Array} Liste des villes favorites de l'utilisateur */
  const [cities, setCities] = useState([]);

  /** @type {boolean} Statut d'authentification de l'utilisateur */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /** @type {Object} États de chargement pour différentes opérations */
  const [loading, setLoading] = useState({
    search: false,    // Chargement lors de la recherche de villes
    cities: true      // Chargement lors du chargement des villes favorites
  });

  /** @type {string} Message d'erreur global */
  const [error, setError] = useState('');

  /** @type {Object|null} Notification temporaire (message + type) */
  const [notification, setNotification] = useState(null);

  // ===== EFFET D'INITIALISATION =====

  /**
   * Effet principal d'initialisation du composant
   * - Vérifie le statut d'authentification
   * - Charge les villes favorites
   * - Configure les listeners pour la synchronisation en temps réel
   */
  useEffect(() => {
    checkAuthStatus();
    loadCities();

    // Écouter les changements dans le localStorage (connexion/déconnexion dans un autre onglet)
    const handleStorageChange = () => {
      checkAuthStatus();
      loadCities();
    };

    window.addEventListener('storage', handleStorageChange);

    // Recharger les données quand l'utilisateur revient sur la page (focus)
    // Utile après connexion/inscription pour mettre à jour l'état
    const handleFocus = () => {
      const newAuthStatus = localStorageAuth.isAuthenticated();
      if (newAuthStatus !== isAuthenticated) {
        checkAuthStatus();
        loadCities();
      }
    };

    window.addEventListener('focus', handleFocus);

    // Nettoyage des listeners à la destruction du composant
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated]);

  // ===== FONCTIONS UTILITAIRES =====

  /**
   * Vérifie et met à jour le statut d'authentification de l'utilisateur
   */
  const checkAuthStatus = () => {
    const authenticated = localStorageAuth.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  /**
   * Charge les villes favorites de l'utilisateur
   * - Utilisateur connecté : charge depuis l'API avec fallback localStorage
   * - Utilisateur non connecté : charge depuis localStorage uniquement
   */
  const loadCities = async () => {
    try {
      setLoading(prev => ({ ...prev, cities: true }));

      if (localStorageAuth.isAuthenticated()) {
        // Utilisateur connecté: charger depuis l'API avec fallback localStorage
        try {
          const response = await citiesAPI.getUserCities();
          // Normaliser les données (MongoDB utilise _id, localStorage utilise id)
          setCities(response.cities.map(city => ({
            ...city,
            id: city._id
          })));
        } catch (apiError) {
          // Si l'API échoue (réseau, serveur down, etc.), utiliser localStorage en fallback
          console.warn('Erreur API, chargement depuis localStorage:', apiError);
          const localCities = localStorageCities.getCities();
          setCities(localCities);
        }
      } else {
        // Utilisateur non connecté: charger depuis localStorage uniquement
        const localCities = localStorageCities.getCities();
        setCities(localCities);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des villes:', err);
      // En cas d'erreur globale, utiliser localStorage comme solution de secours
      const localCities = localStorageCities.getCities();
      setCities(localCities);
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  // ===== GESTIONNAIRES D'ÉVÉNEMENTS =====

  /**
   * Gère la recherche de villes via l'API OpenWeatherMap
   * @param {string} query - Nom de la ville à rechercher
   */
  const handleSearch = async (query) => {
    try {
      setLoading(prev => ({ ...prev, search: true }));
      setError(''); // Réinitialiser les erreurs précédentes

      // Appel à l'API de géocodage OpenWeatherMap
      const response = await weatherAPI.searchCity(query);
      setSearchResults(response.cities);

      // Notification si aucun résultat trouvé
      if (response.cities.length === 0) {
        showNotification('Aucune ville trouvée pour cette recherche', 'warning');
      }
    } catch (err) {
      console.error('Erreur de recherche:', err);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
      setSearchResults([]); // Vider les résultats en cas d'erreur
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  /**
   * Gère l'ajout d'une ville aux favoris (depuis les résultats de recherche)
   * @param {Object} cityData - Données de la ville (name, country, lat, lon)
   */
  const handleSelectCity = async (cityData) => {
    try {
      if (isAuthenticated) {
        // Utilisateur connecté: sauvegarder dans l'API et MongoDB
        const response = await citiesAPI.addCity(cityData);
        // Normaliser les IDs et mettre à jour l'état local
        setCities(response.cities.map(city => ({
          ...city,
          id: city._id
        })));
        showNotification('Ville ajoutée à vos favoris', 'success');
      } else {
        // Utilisateur non connecté: sauvegarder localement dans localStorage
        const result = localStorageCities.addCity(cityData);

        if (result.success) {
          setCities(result.cities);
          showNotification('Ville ajoutée', 'success');
        } else {
          // Ville déjà existante ou erreur de stockage
          showNotification(result.message, 'warning');
        }
      }

      // Fermer les résultats de recherche après sélection
      setSearchResults([]);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la ville:', err);

      // Gestion des erreurs spécifiques de l'API
      if (err.response?.status === 400) {
        showNotification(err.response.data.message, 'warning');
      } else {
        showNotification('Erreur lors de l\'ajout de la ville', 'error');
      }
    }
  };

  /**
   * Gère l'ajout/suppression d'une ville des favoris (toggle)
   * @param {Object} cityData - Données de la ville
   */
  const handleToggleFavorite = async (cityData) => {
    // Normaliser l'ID (MongoDB vs localStorage)
    const cityId = cityData.id || cityData._id;
    const isFavorite = cities.some(c => (c.id || c._id) === cityId);

    if (isFavorite) {
      // Supprimer la ville des favoris
      try {
        if (isAuthenticated) {
          // Utilisateur connecté: supprimer via l'API
          const response = await citiesAPI.removeCity(cityId);
          setCities(response.cities.map(city => ({
            ...city,
            id: city._id
          })));
        } else {
          // Utilisateur non connecté: supprimer du localStorage
          const result = localStorageCities.removeCity(cityId);
          if (result.success) {
            setCities(result.cities);
          }
        }
        showNotification('Ville supprimée de vos favoris', 'success');
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        showNotification('Erreur lors de la suppression', 'error');
      }
    } else {
      // Ajouter la ville aux favoris (réutilise la logique d'ajout)
      await handleSelectCity(cityData);
    }
  };

  /**
   * Affiche une notification temporaire à l'utilisateur
   * @param {string} message - Message à afficher
   * @param {string} type - Type de notification (success, error, warning, info)
   */
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    // Auto-suppression après 4 secondes
    setTimeout(() => setNotification(null), 4000);
  };


  // ===== RENDU DU COMPOSANT =====

  return (
    <div className="main-container">
      {/* En-tête avec navigation et authentification */}
      <Header />

      {/* Système de notifications temporaires */}
      {notification && (
        <div className={`
          fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300
          ${notification.type === 'success' ? 'bg-green-500/90 text-white' : ''}
          ${notification.type === 'error' ? 'bg-red-500/90 text-white' : ''}
          ${notification.type === 'warning' ? 'bg-yellow-500/90 text-white' : ''}
        `}>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Section héro avec titre et recherche */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Cloud className="h-16 w-16 text-white/80 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              WeatherApp+
            </h1>
          </div>

          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Suivez la météo de vos villes préférées en temps réel
          </p>

          {/* Barre de recherche de villes */}
          <div className="mb-6">
            <SearchBar
              onSearch={handleSearch}
              loading={loading.search}
            />
          </div>

          {/* Affichage des résultats de recherche */}
          <SearchResults
            cities={searchResults}
            onSelectCity={handleSelectCity}
            loading={loading.search}
          />
        </div>

        {/* Bandeau d'information pour les utilisateurs non connectés */}
        {!isAuthenticated && cities.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-blue-300 mr-3 flex-shrink-0" />
                <div className="text-blue-100 text-sm">
                  <p>
                    Vous consultez la météo en mode invité. Vos villes sont stockées localement.
                    <br />
                    <strong>Créez un compte</strong> pour synchroniser vos données sur tous vos appareils !
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard principal avec les cartes météo */}
        <section className="max-w-7xl mx-auto">
          {loading.cities ? (
            // État de chargement des villes
            <div className="text-center py-12">
              <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
              <p className="text-white/80">Chargement de vos villes...</p>
            </div>
          ) : cities.length === 0 ? (
            // État vide - Aucune ville ajoutée
            <div className="text-center py-12">
              <Cloud className="h-24 w-24 text-white/40 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-white/80 mb-4">
                Aucune ville ajoutée
              </h2>
              <p className="text-white/60 mb-6">
                Recherchez une ville ci-dessus pour commencer à suivre la météo
              </p>
            </div>
          ) : (
            // Affichage de la grille de cartes météo
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Vos villes ({cities.length})
                </h2>
                {!isAuthenticated && (
                  <p className="text-white/60 text-sm">
                    Stocké localement
                  </p>
                )}
              </div>

              {/* Grille responsive des cartes météo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city) => (
                  <WeatherCard
                    key={city.id || city._id}
                    city={city}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Affichage des erreurs globales */}
        {error && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-300 mr-3 flex-shrink-0" />
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pied de page */}
      <footer className="mt-16 py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60 text-sm">
            WeatherApp+ - Données fournies par OpenWeatherMap
          </p>
        </div>
      </footer>
    </div>
  );
}
