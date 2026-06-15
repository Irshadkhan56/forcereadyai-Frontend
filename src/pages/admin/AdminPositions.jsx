import { useState, useEffect } from 'react';
import { getOrgsApi, getCategoriesApi, getPositionsApi, createPositionApi, updatePositionApi, deletePositionApi } from '../../services/adminService';
import { Plus, Edit2, Trash2, X, AlertCircle, Briefcase } from 'lucide-react';

const AdminPositions = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', organization: '', category: '' });
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
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedOrgId) return;
      try {
        const res = await getCategoriesApi(selectedOrgId);
        const catList = res.data || res;
        setCategories(catList);
        if (catList.length > 0) {
          setSelectedCatId(catList[0]._id);
        } else {
          setSelectedCatId('');
          setPositions([]);
        }
      } catch (err) {
        setError('Failed to fetch categories.');
      }
    };
    fetchCategories();
  }, [selectedOrgId]);

  // Fetch positions when selected category changes
  const fetchPositions = async () => {
    if (!selectedCatId || !selectedOrgId) return;
    setLoading(true);
    try {
      const res = await getPositionsApi(selectedCatId, selectedOrgId);
      setPositions(res.data || res);
    } catch (err) {
      setError('Failed to fetch positions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [selectedCatId, selectedOrgId]);

  const openAddModal = () => {
    if (!selectedOrgId || !selectedCatId) {
      alert('Please select organization and category first.');
      return;
    }
    setEditingPosition(null);
    setFormData({ name: '', description: '', organization: selectedOrgId, category: selectedCatId });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (pos) => {
    setEditingPosition(pos);
    setFormData({
      name: pos.name,
      description: pos.description || '',
      organization: pos.organization,
      category: pos.category
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.organization || !formData.category) {
      setFormError('Name, Organization, and Category are required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingPosition) {
        await updatePositionApi(editingPosition._id, formData);
      } else {
        await createPositionApi(formData);
      }
      setIsModalOpen(false);
      fetchPositions();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Ensure position is unique within this category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this position? Users preparing for this position will lose access to specific resources.')) {
      return;
    }
    try {
      await deletePositionApi(id);
      fetchPositions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete position');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Positions</h1>
          <p className="text-gray-400 text-sm mt-1">Manage preparation profiles (e.g. PMA Long Course, General Duty Soldier, Inspector).</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-red-500/20"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Position
        </button>
      </div>

      {/* Selectors panel */}
      <div className="glass-panel p-5 rounded-2xl border border-gray-850 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Organization
          </label>
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="glass-input rounded-xl py-2 px-4 text-sm text-white focus:outline-none cursor-pointer"
          >
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Category
          </label>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="glass-input rounded-xl py-2 px-4 text-sm text-white focus:outline-none cursor-pointer"
            disabled={categories.length === 0}
          >
            {categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))
            ) : (
              <option value="">No Categories Available</option>
            )}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Positions Table */}
      <div className="glass-panel rounded-2xl border border-gray-850 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/20 text-gray-500 text-xs font-bold uppercase">
                <th className="py-4 px-6">Position Name</th>
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
              ) : positions.length > 0 ? (
                positions.map((pos) => (
                  <tr key={pos._id} className="hover:bg-gray-900/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{pos.name}</td>
                    <td className="py-4 px-6 text-gray-450">
                      {pos.description || <span className="text-gray-650 italic text-xs">No description provided</span>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(pos)}
                          className="p-1.5 rounded-lg border border-gray-800 bg-gray-900/40 hover:bg-gray-800 hover:text-white transition-all cursor-pointer text-gray-400"
                          title="Edit Position"
                        >
                          <Edit2 className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pos._id)}
                          className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition-all cursor-pointer"
                          title="Delete Position"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-gray-500">
                    No positions found for this category. Click "Add Position" to create one.
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
                <Briefcase className="w-5 h-5 text-red-500" />
                {editingPosition ? 'Edit Position' : 'Create Position'}
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
                  Position Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. PMA Long Course"
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
                  placeholder="Details about requirements, structure, or training scope..."
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
                  {submitting ? 'Saving...' : 'Save Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPositions;
