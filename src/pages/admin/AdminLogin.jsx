import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const { login, logout, user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as admin, redirect to admin dashboard
  if (user && !loading && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        // Not an admin user, log out immediately
        logout();
        setError('Access Denied: You do not have administrator privileges.');
        setSubmitting(false);
      }
    } else {
      setError(result.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-premium relative overflow-hidden px-4">
      {/* Red/Crimson glow for admin zone */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium">Checking privileges...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10"
        >
          {/* Admin Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center mb-3 animate-pulse">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
              Force<span className="text-red-500">Ready</span> <span className="text-xs font-semibold px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 uppercase tracking-widest ml-1">Admin</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1 font-medium">Portal Security & Configuration Console</p>
          </div>

          <h2 className="text-lg font-bold text-white mb-6 text-center">Admin Console Authentication</h2>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-655 focus:outline-none"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder-gray-655 focus:outline-none"
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Console'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-850/60 text-center text-sm text-gray-400">
            Looking for the candidate portal?{' '}
            <Link to="/login" className="text-red-400 hover:text-red-300 font-bold transition-all ml-1">
              Candidate Sign In
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminLogin;
