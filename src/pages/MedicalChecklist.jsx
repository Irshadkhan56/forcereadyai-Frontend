import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelection } from '../context/SelectionContext';
import api from '../services/api';
import {
  HeartPulse,
  Award,
  Loader2,
  CheckCircle,
  HelpCircle,
  Lock,
  ChevronRight,
  ClipboardList,
  Save,
  Edit2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

const MedicalChecklist = () => {
  const queryClient = useQueryClient();
  const { selectedDepartment, selectedSubCategory, selectedPosition } = useSelection();

  // Keep track of which criteria ID is being edited inline
  const [editingId, setEditingId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');

  // 1. Fetch User Medical Checklist Progress
  const { data: progressData, isLoading, error } = useQuery({
    queryKey: ['medicalProgress', selectedDepartment?._id, selectedSubCategory, selectedPosition],
    queryFn: async () => {
      const res = await api.get(`/medical-tests/progress`, {
        params: {
          departmentId: selectedDepartment._id,
          subCategory: selectedSubCategory,
          position: selectedPosition,
        },
      });
      return res.data.data;
    },
    enabled: !!selectedDepartment?._id,
  });

  // 2. Update Progress Mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ criteriaId, status, notes }) => {
      const res = await api.put('/medical-tests/progress', {
        departmentId: selectedDepartment._id,
        criteriaId,
        status,
        notes,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalProgress', selectedDepartment?._id, selectedSubCategory, selectedPosition] });
      setEditingId(null);
    },
    onError: (err) => {
      console.error('Failed to update medical progress:', err);
      alert(err.response?.data?.message || 'Failed to save progress.');
    },
  });

  const handleEditStart = (cr) => {
    setEditingId(cr._id);
    setCurrentStatus(cr.status);
    setCurrentNotes(cr.notes);
  };

  const handleSave = (crId) => {
    updateProgressMutation.mutate({
      criteriaId: crId,
      status: currentStatus,
      notes: currentNotes,
    });
  };

  const handleQuickStatusChange = (cr, newStatus) => {
    updateProgressMutation.mutate({
      criteriaId: cr._id,
      status: newStatus,
      notes: cr.notes,
    });
  };

  // Guard: No selection
  if (!selectedDepartment || (selectedDepartment.hasSubCategories && (!selectedSubCategory || !selectedPosition))) {
    return (
      <div className="glass-panel p-10 rounded-2xl text-center space-y-5 max-w-lg mx-auto">
        <Lock className="w-12 h-12 text-primary-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Target Selection Required</h2>
        <p className="text-gray-400 text-xs leading-relaxed">
          You must set your active target force department and entry/post before pre-validating medical standards.
        </p>
        <div className="pt-2">
          <Link
            to="/departments"
            className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
          >
            Open Selection Wizard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Loader state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-gray-500 text-sm">Loading medical checklist parameters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-red-500/10 text-center text-red-400 space-y-3">
        <HelpCircle className="w-12 h-12 text-red-500/40 mx-auto" />
        <h3 className="font-bold text-white">Initialization Error</h3>
        <p className="text-xs">{error.response?.data?.message || 'Failed to initialize active progress trackers.'}</p>
      </div>
    );
  }

  // Calculate statistics
  const criteria = progressData?.criteria || [];
  const passedCount = criteria.filter((cr) => cr.status === 'passed').length;
  const failedCount = criteria.filter((cr) => cr.status === 'failed').length;
  const totalCount = criteria.length;
  const passedPercent = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* MOTIVATIONAL HEADER */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/15 border border-rose-500/20 rounded-full text-xs font-semibold text-rose-400">
            <HeartPulse className="w-4 h-4" /> Medical Pre-Validation
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Medical Standards: <span className="text-rose-500">{selectedDepartment?.name}{selectedPosition ? ` - ${selectedPosition}` : ''}</span>
          </h1>
          <p className="text-gray-300 text-base max-w-xl">
            Pre-validate your physical dimensions, height requirements, and visual health guidelines before the official service board clinical exams.
          </p>
        </div>

        {/* Circular indicator or Badge */}
        <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-850 flex items-center gap-5 relative z-10 flex-shrink-0">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Passed Standards</span>
            <div className="text-2xl font-black text-white">{passedCount} <span className="text-sm text-gray-400 font-semibold">/ {totalCount} Items</span></div>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-rose-500/20 flex items-center justify-center font-bold text-sm text-rose-400 relative">
            <span className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin-slow pointer-events-none" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
            {passedPercent}%
          </div>
        </div>
      </div>

      {/* METRIC PROGRESS BAR */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm font-semibold uppercase tracking-wider">
          <span className="text-gray-300">Overall Passed Checklist</span>
          <span className="font-bold text-rose-400">{passedPercent}% Verified</span>
        </div>
        <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-850/80">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-red-400 rounded-full transition-all duration-500"
            style={{ width: `${passedPercent}%` }}
          />
        </div>
      </div>

      {/* CHECKLIST SECTION */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-rose-400" /> Physical Standards & Conditions
          </h2>
          <p className="text-gray-300 text-sm mt-1">Toggle criteria statuses and log clinical notes from doctor visits</p>
        </div>

        <div className="space-y-4">
          {criteria.map((cr) => {
            const isEditing = editingId === cr._id;
            const saving = updateProgressMutation.isPending && editingId === cr._id;

            // Status Badge configuration
            let statusColor = 'bg-gray-900 border-gray-800 text-gray-400';
            if (cr.status === 'passed') statusColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            if (cr.status === 'failed') statusColor = 'bg-red-500/10 border-red-500/20 text-red-400';

            return (
              <div
                key={cr._id}
                className={`glass-panel p-6 rounded-2xl border transition-all space-y-4 ${
                  cr.status === 'passed'
                    ? 'border-emerald-500/15'
                    : cr.status === 'failed'
                    ? 'border-red-500/15'
                    : 'border-gray-850 hover:border-gray-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cr.status === 'passed' ? 'bg-emerald-500' : cr.status === 'failed' ? 'bg-red-500' : 'bg-gray-700'}`} />
                      <h4 className="font-bold text-base text-white">{cr.name}</h4>
                      <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold tracking-wide uppercase ${statusColor}`}>
                        {cr.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed">
                      Official Guideline: <span className="text-white font-semibold">{cr.requirement}</span>
                    </div>
                  </div>

                  {/* Quick toggle controls */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleQuickStatusChange(cr, 'passed')}
                      className={`p-1.5 rounded-lg border text-emerald-400 hover:text-white hover:bg-emerald-600/30 transition-all cursor-pointer ${cr.status === 'passed' ? 'bg-emerald-600/20 border-emerald-500/40' : 'bg-gray-900/50 border-gray-850'}`}
                      title="Mark Passed"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickStatusChange(cr, 'failed')}
                      className={`p-1.5 rounded-lg border text-red-400 hover:text-white hover:bg-red-600/30 transition-all cursor-pointer ${cr.status === 'failed' ? 'bg-red-600/20 border-red-500/40' : 'bg-gray-900/50 border-gray-850'}`}
                      title="Mark Failed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline form or info logs */}
                {isEditing ? (
                  <div className="space-y-4 pt-3 border-t border-gray-800/80 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-xs font-bold tracking-wider mb-1">Clinic / Doctor Notes</label>
                        <input
                          type="text"
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="e.g. Vision verified 6/6 by civil hospital"
                          className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-xs font-bold tracking-wider mb-1">Verify Status</label>
                        <select
                          value={currentStatus}
                          onChange={(e) => setCurrentStatus(e.target.value)}
                          className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                        >
                          <option value="unchecked">Unchecked</option>
                          <option value="passed">Passed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 text-sm">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2.5 border border-gray-800 hover:border-gray-750 bg-gray-900 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(cr._id)}
                        disabled={saving}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-all flex items-center gap-1 shadow-md hover:shadow-rose-500/10 cursor-pointer"
                      >
                        {saving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" /> Save Notes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-850/80 text-sm">
                    <div className="flex items-center gap-1 text-gray-400 min-w-0">
                      <span className="flex-shrink-0">Clinic Logs:</span>
                      <span className="text-gray-200 italic truncate max-w-[400px] block pl-1">
                        {cr.notes || 'No notes added yet'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleEditStart(cr)}
                      className="p-2 border border-gray-850 hover:border-gray-800 hover:bg-gray-800/40 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
                      title="Update notes and status"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MedicalChecklist;
