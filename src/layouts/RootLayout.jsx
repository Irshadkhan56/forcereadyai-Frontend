import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  MessageSquareText,
  Activity,
  HeartPulse,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const RootLayout = () => {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Organizations',
      path: '/organizations',
      icon: Building2,
    },
    {
      name: 'Mock Interviews',
      path: '/interviews',
      icon: MessageSquareText,
    },
    {
      name: 'Physical Plan',
      path: '/progress/physical',
      icon: Activity,
    },
    {
      name: 'Medical Checklist',
      path: '/progress/medical',
      icon: HeartPulse,
    },
    {
      name: 'Readiness Hub',
      path: '/progress/readiness',
      icon: Award,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-premium">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-dark-950 text-gray-100 font-sans">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* MOBILE SIDEBAR DRAWER */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel p-6 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                  <img src={logoImg} alt="ForceReady.AI Logo" className="h-8 w-auto" />
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg border border-gray-800 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-600/20 border border-primary-500/30 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : ''}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-gray-800/80 pt-4 mt-auto">
                <div className="flex items-center gap-3 mb-4 px-2">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-primary-500/20 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary-600/20 border border-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold uppercase">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate text-white">{user?.name}</p>
                    <p className="text-xs truncate text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-y-0 border-l-0 p-6 relative z-30">
        <Link to="/dashboard" className="flex items-center mb-10 px-2">
          <img src={logoImg} alt="ForceReady.AI Logo" className="h-10 w-auto" />
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600/15 border border-primary-500/30 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : ''}`} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-primary-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-800/80 pt-4 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover border border-primary-500/20 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 bg-primary-600/20 border border-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-white">{user?.name}</p>
              <p className="text-xs truncate text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 relative z-20">
        {/* MOBILE HEADER */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 glass-panel border-x-0 border-t-0">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-500" />
            <span className="font-extrabold text-lg tracking-tight">
              Force<span className="text-primary-500">Ready</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* PAGE BODY */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Animated sub-page transition wrapper */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
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

export default RootLayout;
