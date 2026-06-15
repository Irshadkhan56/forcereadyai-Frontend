import { useState, useEffect } from 'react';
import { getOrgsApi, createOrgApi, updateOrgApi, deleteOrgApi } from '../../services/adminService';
import { Plus, Edit2, Trash2, X, AlertCircle, Sparkles } from 'lucide-react';

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', logo: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await getOrgsApi();
      if (res.success || Array.isArray(res)) {
        // Handle array response or nested data object
        setOrganizations(res.data || res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const openAddModal = () => {
    setEditingOrg(null);
    setFormData({ name: '', description: '', logo: '/assets/logos/default.png' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (org) => {
    setEditingOrg(org);
    setFormData({ name: org.name, description: org.description, logo: org.logo });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.logo) {
      setFormError('All fields are required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingOrg) {
        await updateOrgApi(editingOrg._id, formData);
      } else {
        await createOrgApi(formData);
      }
      setIsModalOpen(false);
      fetchOrgs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Ensure values are unique.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Warning: Deleting this organization will remove its hierarchy. Categories and Positions linked to it may become orphaned. Are you sure?')) {
      return;
    }
    try {
      await deleteOrgApi(id);
      fetchOrgs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete organization');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Organizations</h1>
          <p className="text-gray-400 text-sm mt-1">Configure and manage target organizations (e.g. Pakistan Army, FIA, etc.).</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-red-500/20"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Organization
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Orgs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : organizations.length > 0 ? (
          organizations.map((org) => (
            <div
              key={org._id}
              className="glass-card p-6 rounded-2xl border border-gray-850 flex flex-col justify-between space-y-4 hover:border-red-500/20"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center p-2 text-white font-bold uppercase text-xs overflow-hidden">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-full h-full object-contain" onError={(e) => { e.target.src = ''; e.target.outerHTML = `<span className="font-bold text-red-500">${org.name.slice(0, 2)}</span>` }} />
                  ) : (
                    org.name.slice(0, 2)
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(org)}
                    className="p-1.5 rounded-lg border border-gray-800 bg-gray-900/40 hover:bg-gray-800 hover:text-white transition-all cursor-pointer text-gray-400"
                    title="Edit Organization"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(org._id)}
                    className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition-all cursor-pointer"
                    title="Delete Organization"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">{org.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{org.description}</p>
              </div>

              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                ID: <span className="font-mono text-gray-600 select-all">{org._id}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No organizations found. Click "Add Organization" to get started.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="p-6 border-b border-gray-850 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                {editingOrg ? 'Edit Organization' : 'Create Organization'}
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
                  Organization Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Pakistan Army"
                  className="w-full glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Logo Asset Path / URL
                </label>
                <input
                  type="text"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  placeholder="e.g. /assets/logos/pakistan-army.png"
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
                  placeholder="Brief description of the organization and its function..."
                  rows="4"
                  className="w-full glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-gray-600 resize-none"
                  required
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
                  {submitting ? 'Saving...' : 'Save Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrganizations;
