'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authAPI } from '../../../lib/api';
import { localStorageAuth, localStorageCities } from '../../../lib/localStorage';
import Header from '../../../components/Header';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Connexion
      const response = await authAPI.login(formData);

      // Sauvegarder le token et les données utilisateur
      localStorageAuth.setToken(response.token);
      localStorageAuth.setUser(response.user);

      // Fusion des données locales avec le compte utilisateur
      try {
        const localCities = localStorageCities.getCitiesForMerging();
        if (localCities.length > 0) {
          await authAPI.mergeCities(localCities);
          // Vider le stockage local après la fusion
          localStorageCities.clearCities();
        }
      } catch (mergeError) {
        console.warn('Erreur lors de la fusion des données:', mergeError);
        // Ne pas bloquer la connexion pour une erreur de fusion
      }

      // Redirection vers le dashboard (page d'accueil) avec remplacement
      router.replace('/');

      // Forcer un rafraîchissement de l'état d'authentification
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(
        err.response?.data?.message ||
        'Erreur lors de la connexion. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <Header />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-md w-full space-y-8">

        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-white/80">
            Ou{' '}
            <Link
              href="/auth/register"
              className="font-medium text-blue-200 hover:text-blue-100 underline"
            >
              créez un nouveau compte
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Entrez votre adresse email"
                disabled={loading}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="Entrez votre mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Bouton de connexion */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter
                </>
              )}
            </button>
          </div>

          {/* Lien vers l'inscription */}
          <div className="text-center">
            <p className="text-white/60 text-sm">
              Vous n'avez pas de compte ?{' '}
              <Link
                href="/auth/register"
                className="text-blue-200 hover:text-blue-100 font-medium underline"
              >
                Inscrivez-vous ici
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;