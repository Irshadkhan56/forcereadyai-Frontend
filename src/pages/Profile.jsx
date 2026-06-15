import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, BookOpen, Lock, Loader2, CheckCircle2, AlertCircle, Camera, Eye, EyeOff } from 'lucide-react';
import { uploadAvatarApi } from '../services/authService';

const Profile = () => {
  const { user, updateProfile, changePassword, updateAvatar } = useAuth();

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [education, setEducation] = useState(user?.education || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Handle Avatar Image Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image file size must be smaller than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (.png, .jpg, .jpeg, .webp)');
      return;
    }

    setProfileError('');
    setProfileMessage('');
    setUploadingAvatar(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await uploadAvatarApi(formData);
      if (res.success) {
        updateAvatar(res.data);
        setProfileMessage('Profile picture updated successfully!');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');

    if (!name || !age || !education) {
      setProfileError('All profile fields are required');
      return;
    }

    if (isNaN(Number(age)) || Number(age) <= 0) {
      setProfileError('Age must be a positive number');
      return;
    }

    setUpdatingProfile(true);
    const result = await updateProfile(name, age, education);
    setUpdatingProfile(false);

    if (result.success) {
      setProfileMessage('Candidate profile updated successfully.');
    } else {
      setProfileError(result.message);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Both current and new passwords are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setUpdatingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setUpdatingPassword(false);

    if (result.success) {
      setPasswordMessage('Security password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setPasswordError(result.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Profile & Security Settings</h1>
        <p className="text-gray-400 text-xs mt-1">Manage your candidate information and change credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="glass-panel p-8 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800/80 pb-3">
            <User className="w-5 h-5 text-primary-500" /> Candidate Profile Information
          </h2>

          {profileMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{profileMessage}</span>
            </div>
          )}

          {profileError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {/* Avatar Upload Container */}
          <div className="flex flex-col items-center justify-center space-y-3 pb-6 border-b border-gray-800/40">
            <div className="relative">
              {uploadingAvatar ? (
                <div className="w-24 h-24 rounded-full bg-gray-900/40 border-2 border-primary-500/30 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary-500/40 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-600/10 border border-primary-500/35 flex items-center justify-center text-primary-500 font-extrabold text-2xl uppercase">
                  {user?.name?.charAt(0) || 'C'}
                </div>
              )}
              
              <label
                htmlFor="avatar-file-input"
                className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-full cursor-pointer shadow-lg border border-primary-400/20 transition-all hover:scale-105"
                title="Upload Profile Image"
              >
                <Camera className="w-4 h-4" />
              </label>
              <input
                type="file"
                id="avatar-file-input"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar || updatingProfile}
              />
            </div>
            <div className="text-center">
              <span className="text-[10px] text-gray-500 block uppercase tracking-wider">JPEG, PNG or WEBP (Max. 5MB)</span>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
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
                  className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none"
                  disabled={updatingProfile}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Age (Years)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none"
                    disabled={updatingProfile}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Education Level
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none"
                    disabled={updatingProfile}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-primary-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {updatingProfile ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving Profiles...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Security / Password Card */}
        <div className="glass-panel p-8 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800/80 pb-3">
            <Lock className="w-5 h-5 text-purple-500" /> Password & Security
          </h2>

          {passwordMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{passwordMessage}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder-gray-700 focus:outline-none"
                  disabled={updatingPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full glass-input rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder-gray-700 focus:outline-none"
                  disabled={updatingPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Updating Security...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
