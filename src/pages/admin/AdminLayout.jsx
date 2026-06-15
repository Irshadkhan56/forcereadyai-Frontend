import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderTree,
  Briefcase,
  HelpCircle,
  UploadCloud,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Candidates', path: '/admin/users', icon: Users },
    { name: 'Organizations', path: '/admin/organizations', icon: Building2 },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Positions', path: '/admin/positions', icon: Briefcase },
    { name: 'Question Bank', path: '/admin/questions', icon: HelpCircle },
    { name: 'Import Questions', path: '/admin/upload-book', icon: UploadCloud },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const sidebarContent = (onClose) => (
    <div className="flex flex-col h-full">
      {/* Brand logo header */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-red-600/20 border border-red-500/30 rounded-lg flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-500" />
        </div>
        <Link to="/admin" className="font-extrabold text-xl tracking-tight text-white" onClick={onClose}>
          Force<span className="text-red-500">Ready</span> <span className="text-xs font-semibold px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 uppercase tracking-widest ml-1">Admin</span>
        </Link>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-red-600/15 border border-red-500/30 text-white shadow-lg shadow-red-950/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-red-500' : ''}`} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-red-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Info */}
      <div className="pt-4 border-t border-gray-850 mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600/20 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 font-bold uppercase text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{user?.email || 'admin@forceready.ai'}</p>
            </div>
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
    </div>
  );

  return (
    <div className="min-h-screen flex bg-dark-950 text-gray-100 font-sans relative">
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-red-500/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-red-600/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel p-6 flex flex-col md:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-lg border border-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent(() => setSidebarOpen(false))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 glass-panel border-y-0 border-l-0 p-6 z-30 flex-shrink-0">
        {sidebarContent(null)}
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 relative z-20 overflow-hidden">
        {/* Navbar */}
        <header className="w-full px-6 py-4 glass-panel border-x-0 border-t-0 flex items-center justify-between z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/50 md:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Administration Panel</span>
          </div>

          <div className="flex items-center gap-4 ml-auto md:ml-0">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 border border-gray-855 hover:border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </header>

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
