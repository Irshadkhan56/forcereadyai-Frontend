import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Calendar, BookOpen, Loader2, AlertCircle, Camera, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !age || !education) {
      setError('Please fill in all fields');
      return;
    }

    if (isNaN(Number(age)) || Number(age) <= 0) {
      setError('Please enter a valid age');
      return;
    }

    setError('');
    setSubmitting(true);

    const result = await register(name, email, password, age, education, profileImage);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6 text-center">Create Candidate Account</h2>

      {error && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Picture Upload Preview */}
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <div className="relative group cursor-pointer w-20 h-20 rounded-full border-2 border-dashed border-gray-800 hover:border-primary-500 bg-gray-900/40 flex items-center justify-center overflow-hidden transition-all shadow-inner">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-500 group-hover:text-primary-500 transition-colors">
                <Camera className="w-6 h-6" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={submitting}
            />
          </div>
          <span className="text-[10px] text-gray-550 font-semibold uppercase tracking-wider">
            {profileImage ? 'Change Image' : 'Upload Profile Photo (Optional)'}
          </span>
        </div>

        <div>
          <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Asim Bajwa"
              className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none"
              disabled={submitting}
              required
            />
          </div>
        </div>

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
          <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Age
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Years"
                className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none"
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Education
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. Bachelor"
                className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none"
                disabled={submitting}
                required
              />
            </div>
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
              Registering...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-800/80 text-center text-sm text-gray-400 flex flex-col gap-2">
        <div>
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-all ml-1">
            Sign In
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

export default Register;
