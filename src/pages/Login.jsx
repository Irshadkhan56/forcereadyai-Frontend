import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      navigate('/dashboard');
    } else {
      setError(result.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6 text-center">Sign In to Your Account</h2>

      {error && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-black dark:text-white text-sm animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. recruit@domain.com"
              className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none"
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
            <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 font-bold transition-all">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none"
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
          className="w-full bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-primary-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-800/80 text-center text-sm text-gray-400 flex flex-col gap-2">
        <div>
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-bold transition-all ml-1">
            Create Account
          </Link>
        </div>
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-850/50">
          Are you an Admin?{' '}
          <Link to="/admin/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-all ml-1">
            Access Admin Console
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
