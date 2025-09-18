'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { authAPI } from '../../../lib/api';
import { localStorageAuth, localStorageCities } from '../../../lib/localStorage';
import Header from '../../../components/Header';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Validation du mot de passe
  const passwordValidation = {
    minLength: formData.password.length >= 6,
    hasMatch: formData.password === formData.confirmPassword && formData.confirmPassword !== ''
  };

  const isPasswordValid = passwordValidation.minLength && passwordValidation.hasMatch;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation côté client
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (formData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    if (!isPasswordValid) {
      setError('Veuillez vérifier que votre mot de passe respecte tous les critères');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Inscription
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // Sauvegarder le token et les données utilisateur
      localStorageAuth.setToken(response.token);
      localStorageAuth.setUser(response.user);

      // Fusion des données locales avec le nouveau compte
      try {
        const localCities = localStorageCities.getCitiesForMerging();
        if (localCities.length > 0) {
          await authAPI.mergeCities(localCities);
          // Vider le stockage local après la fusion
          localStorageCities.clearCities();
        }
      } catch (mergeError) {
        console.warn('Erreur lors de la fusion des données:', mergeError);
        // Ne pas bloquer l'inscription pour une erreur de fusion
      }

      // Redirection automatique vers le dashboard après inscription avec remplacement
      router.replace('/');

      // Forcer un rafraîchissement de l'état d'authentification
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError(
        err.response?.data?.message ||
        'Erreur lors de l\'inscription. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }) => {
    if (isValid) {
      return <Check className="h-4 w-4 text-green-400" />;
    }
    return <X className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="main-container">
      <Header />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-md w-full space-y-8">

        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Créer votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-white/80">
            Ou{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-200 hover:text-blue-100 underline"
            >
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nom d'utilisateur */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder="Choisissez un nom d'utilisateur"
                disabled={loading}
              />
              {formData.username.length > 0 && formData.username.length < 3 && (
                <p className="mt-1 text-sm text-red-300">
                  Le nom d'utilisateur doit contenir au moins 3 caractères
                </p>
              )}
            </div>

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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="Créez un mot de passe"
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

              {/* Critères de validation du mot de passe */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <ValidationIcon isValid={passwordValidation.minLength} />
                    <span className={passwordValidation.minLength ? 'text-green-300' : 'text-red-300'}>
                      Au moins 6 caractères
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation du mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="Confirmez votre mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Validation de la correspondance */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <ValidationIcon isValid={passwordValidation.hasMatch} />
                    <span className={passwordValidation.hasMatch ? 'text-green-300' : 'text-red-300'}>
                      Les mots de passe correspondent
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Bouton d'inscription */}
          <div>
            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full btn-primary flex items-center justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Création du compte...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer mon compte
                </>
              )}
            </button>
          </div>

          {/* Lien vers la connexion */}
          <div className="text-center">
            <p className="text-white/60 text-sm">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/auth/login"
                className="text-blue-200 hover:text-blue-100 font-medium underline"
              >
                Connectez-vous ici
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;