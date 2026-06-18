import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowLeft,
  FaKey,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { forgotPasswordApi, resetPasswordApi } from '../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Core states
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // OTP & Password Reset states
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI feedback states
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Redirection timer after password reset success
  useEffect(() => {
    if (!successMessage) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [successMessage, navigate]);

  // Handle requesting OTP email
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await forgotPasswordApi(email);
      if (res.success) {
        setOtpSent(true);
        // Show success alert temporarily but keep form visible in state 2
        setError(''); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle resetting password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const res = await resetPasswordApi(email, otp, password);
      if (res.success) {
        setSuccessMessage('Password reset successful! You can now log in with your new password.');
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code. Please check and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        {successMessage ? 'Success!' : otpSent ? 'Verify OTP Code' : 'Forgot Your Password?'}
      </h2>
      <p className="text-sm text-gray-300 text-center mb-6 leading-relaxed">
        {successMessage
          ? 'Your password has been successfully updated.'
          : otpSent
          ? `Enter the 6-digit verification code sent to ${email} along with your new password.`
          : "Enter your registered email address below. We'll send you a One-Time Password (OTP) code."}
      </p>

      {error && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-black dark:text-white text-sm animate-shake">
          <FaExclamationTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage ? (
        <div className="space-y-6 text-center">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-sm text-left">
            <FaCheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>

          <p className="text-sm text-gray-405">
            Redirecting you to the sign-in page in <span className="font-bold text-primary-400 font-mono">{countdown}</span> seconds...
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all"
          >
            Go to Login Now
          </button>
        </div>
      ) : otpSent ? (
        // State 2: Enter OTP, New Password, Confirm New Password
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-3 bg-primary-600/10 border border-primary-500/10 rounded-xl text-sm text-primary-405 leading-normal flex items-start gap-2.5">
            <FaCheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-500" />
            <span>OTP sent! Check your email inbox (and spam folder) for the 6-digit verification code.</span>
          </div>

          <div>
            <label className="block text-gray-350 text-sm font-semibold uppercase tracking-wider mb-2">
              Verification OTP Code
            </label>
            <div className="relative">
              <FaKey className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g. 123456"
                maxLength={6}
                className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-650 focus:outline-none tracking-widest font-mono font-bold"
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-350 text-sm font-semibold uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full glass-input rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder-gray-650 focus:outline-none"
                disabled={submitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash className="w-4.5 h-4.5" /> : <FaEye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-350 text-sm font-semibold uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full glass-input rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder-gray-650 focus:outline-none"
                disabled={submitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash className="w-4.5 h-4.5" /> : <FaEye className="w-4.5 h-4.5" />}
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
                <FaSpinner className="w-5 h-5 animate-spin" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="mt-6 pt-4 border-t border-gray-850 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="text-gray-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-medium text-sm"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
              Resend OTP
            </button>
            <Link
              to="/login"
              className="text-gray-400 hover:text-white transition-all font-medium text-sm"
            >
              Return to Sign In
            </Link>
          </div>
        </form>
      ) : (
        // State 1: Enter email
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div>
            <label className="block text-gray-350 text-sm font-semibold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. candidate@domain.com"
                className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-650 focus:outline-none"
                disabled={submitting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-primary-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {submitting ? (
              <>
                <FaSpinner className="w-5 h-5 animate-spin" />
                Sending OTP Code...
              </>
            ) : (
              'Send Verification OTP'
            )}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-805 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <FaArrowLeft className="w-4 h-4" />
              Return to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
