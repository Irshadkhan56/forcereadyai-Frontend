import { createContext, useState, useEffect, useContext } from 'react';
import {
  loginApi,
  registerApi,
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
  googleAuthApi,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored token and user profile on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Fetch fresh user profile from backend to ensure token is still valid
          const responseData = await getProfileApi();
          if (responseData.success) {
            setUser(responseData.data);
            localStorage.setItem('user', JSON.stringify(responseData.data));
          }
        } catch (error) {
          console.error('Failed to restore authentication session:', error);
          // Session is invalid or expired, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const responseData = await loginApi(email, password);
      if (responseData.success) {
        const { token, data } = responseData;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return { success: true, role: data.role };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (name, email, password, age, education, profileImage) => {
    try {
      const responseData = await registerApi(name, email, password, age, education, profileImage);
      if (responseData.success) {
        const { token, data } = responseData;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return { success: true, role: data.role };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please check your inputs.';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Google Sign-In handler
  const googleLogin = async (googleUserData) => {
    try {
      const responseData = await googleAuthApi(googleUserData);
      if (responseData.success) {
        const { token, data } = responseData;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return { success: true, role: data.role };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Google sign-in failed.';
      return { success: false, message };
    }
  };

  // Update Profile handler
  const updateProfile = async (name, age, education) => {
    try {
      const responseData = await updateProfileApi(name, age, education);
      if (responseData.success) {
        const updatedUser = responseData.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      return { success: false, message };
    }
  };

  // Update Avatar handler
  const updateAvatar = (updatedUserData) => {
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    setUser(updatedUserData);
  };

  // Change Password handler
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const responseData = await changePasswordApi(currentPassword, newPassword);
      if (responseData.success) {
        return { success: true, message: responseData.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password.';
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    updateAvatar,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to access Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
