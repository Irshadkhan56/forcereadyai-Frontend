import { useState, useEffect } from 'react';
import { getOrgsApi, getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../../services/adminService';
import { Plus, Edit2, Trash2, X, AlertCircle, FolderTree } from 'lucide-react';

const AdminCategories = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', organization: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial organizations list
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await getOrgsApi();
        const orgList = res.data || res;
        setOrganizations(orgList);
        if (orgList.length > 0) {
          setSelectedOrgId(orgList[0]._id);
        }
      } catch (err) {
        setError('Failed to load organizations.');
      }
    };
    fetchOrgs();
  }, []);

  // Fetch categories when selected organization changes
  const fetchCategories = async () => {
    if (!selectedOrgId) return;
    setLoading(true);
    try {
      const res = await getCategoriesApi(selectedOrgId);
      setCategories(res.data || res);
    } catch (err) {
      setError('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedOrgId]);

  const openAddModal = () => {
    if (!selectedOrgId) {
      alert('Please select or create an organization first.');
      return;
    }
    setEditingCategory(null);
    setFormData({ name: '', description: '', organization: selectedOrgId });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '', organization: cat.organization });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.organization) {
      setFormError('Name and Organization are required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingCategory) {
        await updateCategoryApi(editingCategory._id, formData);
      } else {
        await createCategoryApi(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Ensure category name is unique within this organization.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Warning: Deleting this category will remove its associated positions and preparation material. Are you sure?')) {
      return;
    }
    try {
      await deleteCategoryApi(id);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Categories</h1>
          <p className="text-gray-400 text-sm mt-1">Manage branches/subcategories within target organizations (e.g. Officer vs Soldier).</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-red-500/20"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Category
        </button>
      </div>

      {/* Selector card */}
      <div className="glass-panel p-5 rounded-2xl border border-gray-850 flex flex-col sm:flex-row items-center gap-4">
        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
          Selected Organization:
        </label>
        <select
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          className="glass-input rounded-xl py-2 px-4 text-sm text-white focus:outline-none w-full sm:w-64 cursor-pointer"
        >
          {organizations.map((org) => (
            <option key={org._id} value={org._id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Categories table */}
      <div className="glass-panel rounded-2xl border border-gray-850 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/20 text-gray-500 text-xs font-bold uppercase">
                <th className="py-4 px-6">Category Name</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850/50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-900/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{cat.name}</td>
                    <td className="py-4 px-6 text-gray-450">
                      {cat.description || <span className="text-gray-650 italic text-xs">No description provided</span>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg border border-gray-800 bg-gray-900/40 hover:bg-gray-800 hover:text-white transition-all cursor-pointer text-gray-400"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition-all cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-gray-500">
                    No categories found for this organization.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="p-6 border-b border-gray-850 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-red-500" />
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Officer"
                  className="w-full glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Commissioned Officers branch exam preparation details..."
                  rows="3"
                  className="w-full glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-gray-600 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-800 bg-gray-900/40 hover:bg-gray-850 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
