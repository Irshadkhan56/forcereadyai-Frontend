import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

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
          className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10"
        >
          {/* App Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-primary-600/20 border border-primary-500/30 rounded-xl flex items-center justify-center mb-3">
              <Shield className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
              Force<span className="text-primary-500">Ready</span> AI
            </h1>
            <p className="text-gray-400 text-xs mt-1">Defense & Civil Services Preparation Hub</p>
          </div>

          {/* Sub-routes (Login / Register forms) */}
          <Outlet />
        </motion.div>
      )}
    </div>
  );
};

export default AuthLayout;
