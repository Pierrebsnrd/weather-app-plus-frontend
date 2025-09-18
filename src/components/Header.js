import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cloud, User, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { localStorageAuth } from '../lib/localStorage';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorageAuth.isAuthenticated();
      const userData = localStorageAuth.getUser();

      setIsAuthenticated(authenticated);
      setUser(userData);
    };

    checkAuth();

    // Écouter les changements dans le localStorage
    const handleStorageChange = () => {
      checkAuth();
    };

    // Vérifier l'état d'authentification quand la fenêtre reprend le focus
    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    // Intervalle pour vérifier le statut d'auth (au cas où localStorage change sans event)
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorageAuth.logout();
    setIsAuthenticated(false);
    setUser(null);
    setIsMenuOpen(false);
    window.location.href = '/';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
            onClick={closeMenu}
          >
            <Cloud className="h-8 w-8" />
            <span className="text-xl font-bold">WeatherApp+</span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-white/80">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    Bonjour, {user?.username}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Connexion</span>
                </Link>

                <Link
                  href="/auth/register"
                  className="flex items-center space-x-1 bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Inscription</span>
                </Link>
              </>
            )}
          </nav>

          {/* Bouton menu mobile */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white p-2"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Navigation mobile */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-md rounded-lg mt-2 mb-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 text-white/80">
                    <User className="h-4 w-4" />
                    <span className="text-sm">
                      Bonjour, {user?.username}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={closeMenu}
                    className="flex items-center space-x-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Connexion</span>
                  </Link>

                  <Link
                    href="/auth/register"
                    onClick={closeMenu}
                    className="flex items-center space-x-2 px-3 py-2 bg-white/20 text-white hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Inscription</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;