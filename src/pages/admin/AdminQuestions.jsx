import { useState, useEffect } from 'react';
import {
  getOrgsApi,
  getCategoriesApi,
  getPositionsApi,
  createQuestionApi
} from '../../services/adminService';
import {
  Plus,
  X,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

const AdminQuestions = () => {
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [positions, setPositions] = useState([]);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    organization: '',
    category: '',
    position: '',
    question: '',
    idealAnswer: '',
    difficulty: 'medium',
    tags: ''
  });
  const [formCategories, setFormCategories] = useState([]);
  const [formPositions, setFormPositions] = useState([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial organizations list
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await getOrgsApi();
        setOrganizations(res.data || res);
      } catch (err) {
        setFormError('Failed to load organizations.');
      }
    };
    fetchOrgs();
  }, []);

  // Form: load categories on org change
  useEffect(() => {
    const fetchFormCategories = async () => {
      if (!formData.organization) {
        setFormCategories([]);
        setFormData(prev => ({ ...prev, category: '', position: '' }));
        return;
      }
      try {
        const res = await getCategoriesApi(formData.organization);
        setFormCategories(res.data || res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFormCategories();
  }, [formData.organization]);

  // Form: load positions on category change
  useEffect(() => {
    const fetchFormPositions = async () => {
      if (!formData.category || !formData.organization) {
        setFormPositions([]);
        setFormData(prev => ({ ...prev, position: '' }));
        return;
      }
      try {
        const res = await getPositionsApi(formData.category, formData.organization);
        setFormPositions(res.data || res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFormPositions();
  }, [formData.category, formData.organization]);

  const openAddModal = () => {
    setFormData({
      organization: organizations[0]?._id || '',
      category: '',
      position: '',
      question: '',
      idealAnswer: '',
      difficulty: 'medium',
      tags: ''
    });
    setFormError('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.organization || !formData.category || !formData.question) {
      setFormError('Organization, Category, and Question text are required');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setSuccessMessage('');

    // Format tags from comma-separated string to string array
    const tagsArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    const submitData = {
      ...formData,
      tags: tagsArray,
      position: formData.position || null
    };

    try {
      await createQuestionApi(submitData);
      setIsModalOpen(false);
      setSuccessMessage('Question added successfully and saved directly to MongoDB!');
      
      // Reset form
      setFormData({
        organization: formData.organization,
        category: formData.category,
        position: formData.position,
        question: '',
        idealAnswer: '',
        difficulty: 'medium',
        tags: ''
      });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-display">Question Bank</h1>
          <p className="text-gray-400 text-sm mt-1">Add and store new mock interview questions directly into MongoDB.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-red-500/20"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Question
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main empty/instruction card */}
      <div className="glass-panel p-8 rounded-2xl border border-gray-850 text-center space-y-4 max-w-xl mx-auto mt-8 animate-fadeIn">
        <HelpCircle className="w-12 h-12 text-gray-500 mx-auto" />
        <div>
          <h3 className="text-lg font-bold text-white font-display">Direct-to-Database Storage</h3>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            Questions are stored directly in MongoDB. To ensure a fast, lag-free user experience, questions are not loaded or listed here.
          </p>
        </div>
        <div className="pt-4 border-t border-gray-850 flex justify-center gap-4">
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-red-650 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all cursor-pointer font-display"
          >
            Create Single Question
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl glass-panel border border-gray-850 rounded-2xl shadow-2xl overflow-hidden animate-zoomIn flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-850 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <HelpCircle className="w-5 h-5 text-red-500" />
                Create Question
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white cursor-pointer"
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-450 text-xs font-semibold uppercase tracking-wider">
                    Organization *
                  </label>
                  <select
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="glass-input rounded-xl py-2 px-3 text-sm text-white focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org._id} value={org._id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-455 text-xs font-semibold uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="glass-input rounded-xl py-2 px-3 text-sm text-white focus:outline-none cursor-pointer"
                    disabled={!formData.organization}
                    required
                  >
                    <option value="">Select Category</option>
                    {formCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-455 text-xs font-semibold uppercase tracking-wider">
                    Position (Optional)
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="glass-input rounded-xl py-2 px-3 text-sm text-white focus:outline-none cursor-pointer"
                    disabled={!formData.category}
                  >
                    <option value="">All Positions / Generic</option>
                    {formPositions.map((pos) => (
                      <option key={pos._id} value={pos._id}>{pos.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-455 text-xs font-semibold uppercase tracking-wider">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="glass-input rounded-xl py-2 px-3 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-455 text-xs font-semibold uppercase tracking-wider">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g. general knowledge, army history, ethics"
                    className="glass-input rounded-xl py-2 px-3.5 text-sm text-white focus:outline-none placeholder-gray-650"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-455 text-xs font-semibold uppercase tracking-wider mb-2">
                  Question Text *
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  placeholder="Enter the mock interview question..."
                  rows="3"
                  className="w-full glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-gray-650 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-455 text-xs font-semibold uppercase tracking-wider mb-2">
                  Suggested Ideal Answer *
                </label>
                <textarea
                  name="idealAnswer"
                  value={formData.idealAnswer}
                  onChange={handleInputChange}
                  placeholder="Enter standard ideal answer templates to grade responses against..."
                  rows="4"
                  className="w-full glass-input rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-gray-655 resize-none"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-800 bg-gray-900/40 hover:bg-gray-855 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-50 cursor-pointer font-display"
                >
                  {submitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
