import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Menu, User } from 'lucide-react';

const Navbar = ({ onMenuOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Sync theme selection to HTML class List and localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full px-6 py-4 glass-panel border-x-0 border-t-0 flex items-center justify-between z-30">
      {/* Mobile Menu Hamburger */}
      <button
        onClick={onMenuOpen}
        className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/50 md:hidden cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Empty space for alignment in desktop / Brand on mobile */}
      <div className="hidden md:block">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate Preparation Panel</span>
      </div>

      {/* Right Navbar Controls */}
      <div className="flex items-center gap-4 ml-auto md:ml-0">
        {/* Theme Toggle (Visual toggle for modern aesthetic) */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 border border-gray-850 hover:border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* User Card info & Logout */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-850">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover border border-primary-500/20"
            />
          ) : (
            <div className="w-8 h-8 bg-primary-600/20 border border-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold uppercase text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.name}</p>
            <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 border border-red-500/10 hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 rounded-xl text-red-400 hover:text-red-300 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
