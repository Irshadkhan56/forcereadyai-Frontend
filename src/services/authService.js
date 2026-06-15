import api from './api';

/**
 * Authentication API Service Client
 */
export const loginApi = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (name, email, password, age, education, profileImage) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  if (age) formData.append('age', Number(age));
  formData.append('education', education);
  
  if (profileImage) {
    formData.append('profileImage', profileImage);
  }

  const response = await api.post('/auth/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getProfileApi = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfileApi = async (name, age, education) => {
  const response = await api.put('/auth/profile', {
    name,
    age: Number(age),
    education,
  });
  return response.data;
};

export const changePasswordApi = async (currentPassword, newPassword) => {
  const response = await api.put('/auth/password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const googleAuthApi = async ({ name, email, profileImage }) => {
  const response = await api.post('/auth/google', { name, email, profileImage });
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (email, otp, password) => {
  const response = await api.post('/auth/reset-password-otp', { email, otp, password });
  return response.data;
};

export const uploadAvatarApi = async (formData) => {
  const response = await api.post('/auth/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
