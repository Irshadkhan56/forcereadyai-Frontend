import { getOrgsApi, createDeptApi, updateDeptApi, deleteDeptApi } from '../../services/adminService';
import { Plus, Edit2, Trash2, X, AlertCircle, Sparkles } from 'lucide-react';

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
    isActive: true,
    hasSubCategories: false
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await getOrgsApi();
      if (res.success || Array.isArray(res)) {
        setOrganizations(res.data || res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const openAddModal = () => {
    setEditingOrg(null);
    setFormData({
      name: '',
      description: '',
      logo: '/assets/logos/default.png',
      banner: '',
      isActive: true,
      hasSubCategories: false
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      description: org.description,
      logo: org.logo,
      banner: org.banner || '',
      isActive: org.isActive !== undefined ? org.isActive : true,
      hasSubCategories: org.hasSubCategories !== undefined ? org.hasSubCategories : false
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.logo) {
      setFormError('Name, description, and logo are required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingOrg) {
        await updateDeptApi(editingOrg._id, formData);
      } else {
        await createDeptApi(formData);
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
    if (!window.confirm('Warning: Deleting this department will remove it permanently and delete all associated questions, medical checklists, and physical plans. Are you sure?')) {
      return;
    }
    try {
      await deleteDeptApi(id);
      fetchOrgs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Departments</h1>
          <p className="text-gray-400 text-sm mt-1">Configure and manage target force departments (e.g. Pakistan Army, FIA, Rangers, etc.).</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-red-500/20"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Department
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : organizations.length > 0 ? (
          organizations.map((org) => (
            <div
              key={org._id}
              className="glass-card p-6 rounded-2xl border border-gray-850 flex flex-col justify-between space-y-4 hover:border-red-500/20 relative overflow-hidden"
            >
              {org.banner && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-cover bg-center" style={{ backgroundImage: `url(${org.banner})` }} />
              )}
              
              <div className="flex items-start justify-between pt-1">
                <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center p-2 text-white font-bold uppercase text-xs overflow-hidden flex-shrink-0">
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-full h-full object-contain" onError={(e) => { e.target.src = ''; e.target.outerHTML = `<span className="font-bold text-red-500">${org.name.slice(0, 2)}</span>` }} />
                  ) : (
                    org.name.slice(0, 2)
                  )}
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded-md border font-semibold tracking-wide uppercase ${org.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                    {org.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {org.hasSubCategories && (
                    <span className="text-[9px] px-2 py-0.5 rounded-md border font-semibold tracking-wide uppercase bg-purple-500/10 border-purple-500/20 text-purple-400">
                      Sub-Cats
                    </span>
                  )}
                  <button
                    onClick={() => openEditModal(org)}
                    className="p-1.5 rounded-lg border border-gray-800 bg-gray-900/40 hover:bg-gray-880 hover:text-white transition-all cursor-pointer text-gray-400"
                    title="Edit Department"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(org._id)}
                    className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition-all cursor-pointer"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1">{org.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{org.description}</p>
                {org.banner && (
                  <p className="text-[10px] text-gray-500 truncate mt-2">Banner: {org.banner}</p>
                )}
              </div>

              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pt-2 border-t border-gray-900/50">
                ID: <span className="font-mono text-gray-600 select-all">{org._id}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No departments found. Click "Add Department" to get started.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg glass-panel border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-zoomIn max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-850 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                {editingOrg ? 'Edit Department' : 'Create Department'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-gray-450 text-xs font-semibold uppercase tracking-wider mb-2">
                  Department Name
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-450 text-xs font-semibold uppercase tracking-wider mb-2">
                    Logo Asset Path / URL
                  </label>
                  <input
                    type="text"
                    name="logo"
                    value={formData.logo}
                    onChange={handleInputChange}
                    placeholder="e.g. /assets/logos/army.png"
                    className="w-full glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-455 text-xs font-semibold uppercase tracking-wider mb-2">
                    Banner URL (Optional)
                  </label>
                  <input
                    type="text"
                    name="banner"
                    value={formData.banner}
                    onChange={handleInputChange}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-450 text-xs font-semibold uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the department and its mission..."
                  rows="3"
                  className="w-full glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-gray-600 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 bg-gray-950/40 p-3 rounded-xl border border-gray-850 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4.5 h-4.5 rounded text-red-600 focus:ring-red-500/20 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Active Status</span>
                    <span className="text-[10px] text-gray-500">Enable candidates to select this force</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-gray-950/40 p-3 rounded-xl border border-gray-850 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasSubCategories"
                    checked={formData.hasSubCategories}
                    onChange={handleInputChange}
                    className="w-4.5 h-4.5 rounded text-red-600 focus:ring-red-500/20 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Subcategories</span>
                    <span className="text-[10px] text-gray-500">Requires multi-step entry class selection</span>
                  </div>
                </label>
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
                  {submitting ? 'Saving...' : 'Save Department'}
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
