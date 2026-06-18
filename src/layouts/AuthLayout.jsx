import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import logoImg from '../assets/logo.png';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  // If already authenticated, redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-premium relative overflow-hidden px-4">
      {/* Decorative background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Initializing session...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md glass-panel p-8 pt-12 rounded-2xl shadow-2xl relative z-10"
        >
          {/* Back to Home Link */}
          <div className="absolute top-4 left-4">
            <Link
              to="/"
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-white transition-all font-semibold uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
            </Link>
          </div>

          {/* App Logo */}
          <Link to="/" className="flex flex-col items-center mb-6 hover:opacity-90 group transition-all">
            <img src={logoImg} alt="ForceReady.AI Logo" className="h-24 w-auto mb-2 group-hover:scale-105 transition-all" />
            <p className="text-gray-400 text-sm font-medium">Defense & Civil Services Preparation Hub</p>
          </Link>

          {/* Sub-routes (Login / Register forms) */}
          <Outlet />
        </motion.div>
      )}
    </div>
  );
};

export default AuthLayout;
