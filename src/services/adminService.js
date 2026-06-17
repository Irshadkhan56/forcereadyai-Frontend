import api from './api';

// ─── Analytics ──────────────────────────────────────────────────────────────
export const getStatsApi = () => api.get('/admin/stats').then(r => r.data);

// ─── Users ──────────────────────────────────────────────────────────────────
export const getUsersApi = (params) => api.get('/admin/users', { params }).then(r => r.data);
export const getUserByIdApi = (id) => api.get(`/admin/users/${id}`).then(r => r.data);
export const blockUserApi = (id) => api.patch(`/admin/users/block/${id}`).then(r => r.data);
export const unblockUserApi = (id) => api.patch(`/admin/users/unblock/${id}`).then(r => r.data);
export const deleteUserApi = (id) => api.delete(`/admin/users/${id}`).then(r => r.data);

// ─── Departments ───────────────────────────────────────────────────────────
export const getOrgsApi = () => api.get('/departments').then(r => r.data); // Keep alias getOrgsApi for easier migration, or rename to getDeptsApi
export const getDeptsApi = () => api.get('/departments').then(r => r.data);
export const createDeptApi = (data) => api.post('/admin/departments', data).then(r => r.data);
export const updateDeptApi = (id, data) => api.put(`/admin/departments/${id}`, data).then(r => r.data);
export const deleteDeptApi = (id) => api.delete(`/admin/departments/${id}`).then(r => r.data);

// ─── Medical & Physical Templates ───────────────────────────────────────────
export const getMedicalTemplateApi = (deptId, subCategory = '', position = '') =>
  api.get('/admin/medical-tests/template', { params: { departmentId: deptId, subCategory, position } }).then(r => r.data);
export const saveMedicalTemplateApi = (data) =>
  api.put('/admin/medical-tests/template', data).then(r => r.data);

export const getPhysicalTemplateApi = (deptId, subCategory = '', position = '') =>
  api.get('/admin/physical-tests/template', { params: { departmentId: deptId, subCategory, position } }).then(r => r.data);
export const savePhysicalTemplateApi = (data) =>
  api.put('/admin/physical-tests/template', data).then(r => r.data);

// ─── Question Bank ────────────────────────────────────────────────────────────
export const getQuestionsApi = (params) => api.get('/admin/questions', { params }).then(r => r.data);
export const createQuestionApi = (data) => api.post('/admin/questions', data).then(r => r.data);
export const updateQuestionApi = (id, data) => api.put(`/admin/questions/${id}`, data).then(r => r.data);
export const deleteQuestionApi = (id) => api.delete(`/admin/questions/${id}`).then(r => r.data);

// ─── Book Upload ──────────────────────────────────────────────────────────────
export const uploadBookApi = (formData) =>
  api.post('/admin/upload-book', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const importQuestionsApi = (questions) =>
  api.post('/admin/questions/import', questions).then(r => r.data);
