import { useState, useEffect, useContext } from 'react';
import { Menu, X, BarChart3, TrendingUp, Users, Zap, BotMessageSquare, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import usercontext from '../context/usercontext'; // Assuming your context is here

// Helper function to get initials from a name string
const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return '?';
  const names = name.trim().split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return `${names[0][0]}`.toUpperCase();
};

// A reusable dropdown component for the logged-in user state (Desktop)
const UserProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const initials = getInitials(user?.name);

  const navigate = (path) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-blue-500 transition-transform hover:scale-105"
      >
        {initials}
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg z-20 animate-in fade-in-0 zoom-in-95">
          <div className="p-2">
            <div className="px-3 py-2 border-b border-slate-700 mb-1">
              <p className="font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'No email'}</p>
            </div>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => { navigate('/profile'); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md cursor-pointer transition-colors text-left"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-slate-800 rounded-md cursor-pointer transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};


export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { token, setToken, userData } = useContext(usercontext);

  const navigate = (path) => {
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch (e) {
        window.location.assign(path);
      }
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Analytics', icon: TrendingUp },
    { name: 'Chatbot', icon: BotMessageSquare },
    { name: 'Chatpage', icon: Zap },
    { name: 'About', icon: Users }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-blue-500/10' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                TataVision
              </h1>
              <p className="text-xs text-slate-400 -mt-1">Social Analytics AI</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                onClick={() => navigate(`/${item.name.toLowerCase()}`)}
                key={item.name}
                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200 flex items-center space-x-2 group"
              >
                <item.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* CTA Buttons - Conditional */}
          <div className="hidden md:flex items-center space-x-4">
            {token && userData ? (
              <UserProfileDropdown user={userData} onLogout={handleLogout} />
            ) : (
              <>
                <Button onClick={() => navigate('/login')} variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/98 backdrop-blur-xl border-t border-slate-800">
          <div className="px-4 py-6 space-y-3">
            {navItems.map((item) => (
              <button
                onClick={() => { navigate(`/${item.name.toLowerCase()}`); setIsMobileMenuOpen(false); }}
                key={item.name}
                className="w-full px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all flex items-center space-x-3"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
            <div className="pt-4 space-y-3 border-t border-slate-800">
              {token && userData ? (
                <>
                  <div className="px-4 py-2 text-center border-b border-slate-800 mb-2">
                     <p className="font-semibold text-white">Welcome, {userData.name}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all flex items-center space-x-3"
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-lg text-red-400 hover:text-white hover:bg-slate-800/50 transition-all flex items-center space-x-3"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800/50">
                    Sign In
                  </Button>
                  <Button onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}