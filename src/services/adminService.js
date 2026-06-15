import api from './api';

// ─── Analytics ──────────────────────────────────────────────────────────────
export const getStatsApi = () => api.get('/admin/stats').then(r => r.data);

// ─── Users ──────────────────────────────────────────────────────────────────
export const getUsersApi = (params) => api.get('/admin/users', { params }).then(r => r.data);
export const getUserByIdApi = (id) => api.get(`/admin/users/${id}`).then(r => r.data);
export const blockUserApi = (id) => api.patch(`/admin/users/block/${id}`).then(r => r.data);
export const unblockUserApi = (id) => api.patch(`/admin/users/unblock/${id}`).then(r => r.data);
export const deleteUserApi = (id) => api.delete(`/admin/users/${id}`).then(r => r.data);

// ─── Organizations ──────────────────────────────────────────────────────────
export const getOrgsApi = () => api.get('/organizations').then(r => r.data);
export const createOrgApi = (data) => api.post('/admin/organizations', data).then(r => r.data);
export const updateOrgApi = (id, data) => api.put(`/admin/organizations/${id}`, data).then(r => r.data);
export const deleteOrgApi = (id) => api.delete(`/admin/organizations/${id}`).then(r => r.data);

// ─── Categories ──────────────────────────────────────────────────────────────
export const getCategoriesApi = (orgId) => api.get(`/categories/${orgId}`).then(r => r.data);
export const createCategoryApi = (data) => api.post('/admin/categories', data).then(r => r.data);
export const updateCategoryApi = (id, data) => api.put(`/admin/categories/${id}`, data).then(r => r.data);
export const deleteCategoryApi = (id) => api.delete(`/admin/categories/${id}`).then(r => r.data);

// ─── Positions ───────────────────────────────────────────────────────────────
export const getPositionsApi = (catId, orgId) =>
  api.get(`/positions/category/${catId}`, { params: { orgId } }).then(r => r.data);
export const createPositionApi = (data) => api.post('/admin/positions', data).then(r => r.data);
export const updatePositionApi = (id, data) => api.put(`/admin/positions/${id}`, data).then(r => r.data);
export const deletePositionApi = (id) => api.delete(`/admin/positions/${id}`).then(r => r.data);

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
