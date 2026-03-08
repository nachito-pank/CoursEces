import { LogIn, LogOut, Settings, Menu, X } from 'lucide-react';
import { Link } from './Link';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface NavbarProps {
  currentPath: string;
}

export function Navbar({ currentPath }: NavbarProps) {
  const { teacher, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setTimeout(() => {
      closeMobileMenu();
    }, 0);
  };

  const handleLogout = () => {
    closeMobileMenu();
    logout();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center space-x-2 sm:space-x-3 font-bold text-lg sm:text-xl text-slate-900"
          >
            <img
              src="https://github.com/nachito-pank/cours-eces/blob/main/public/Logo/logo.jpg"
              alt="Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
            <span className="hidden sm:inline">ECES</span>
            <span className="sm:hidden">ECES</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            <Link
              to="/"
              className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors text-sm xl:text-base ${
                currentPath === '/'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Accueil
            </Link>
            <Link
              to="/courses"
              className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors text-sm xl:text-base ${
                currentPath === '/courses'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cours
            </Link>

            {teacher ? (
              <>
                <Link
                  to="/teacher/dashboard"
                  className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors text-sm xl:text-base ${
                    currentPath === '/teacher/dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mes Cours
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 xl:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm xl:text-base"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline">Déconnexion</span>
                  <span className="xl:hidden">Quitter</span>
                </button>
              </>
            ) : (
              <Link
                to="/teacher/login"
                className="flex items-center space-x-2 px-3 xl:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm xl:text-base"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden xl:inline">Espace Enseignant</span>
                <span className="xl:hidden">Enseignant</span>
              </Link>
            )}

            <Link
              to="/admin"
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Admin"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={handleNavClick}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentPath === '/'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Accueil
              </Link>
              <Link
                to="/courses"
                onClick={handleNavClick}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentPath === '/courses'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cours
              </Link>

              {teacher ? (
                <>
                  <Link
                    to="/teacher/dashboard"
                    onClick={handleNavClick}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      currentPath === '/teacher/dashboard'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Mes Cours
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/teacher/login"
                  onClick={handleNavClick}
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Espace Enseignant</span>
                </Link>
              )}

              <Link
                to="/admin"
                onClick={handleNavClick}
                className="flex items-center space-x-2 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
              >
                <Settings className="w-5 h-5" />
                <span>Administration</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
