import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelection } from '../context/SelectionContext';
import api from '../services/api';
import {
  Activity,
  Award,
  Loader2,
  CheckCircle,
  HelpCircle,
  Lock,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Edit2,
  Save,
} from 'lucide-react';

const PhysicalPlan = () => {
  const queryClient = useQueryClient();
  const { selectedDepartment, selectedSubCategory, selectedPosition } = useSelection();

  // Keep track of which exercise index is being edited inline
  const [editingId, setEditingId] = useState(null);
  const [currentVal, setCurrentVal] = useState('');
  const [isDone, setIsDone] = useState(false);

  // 1. Fetch User Physical Progress
  const { data: progressData, isLoading, error } = useQuery({
    queryKey: ['physicalProgress', selectedDepartment?._id, selectedSubCategory, selectedPosition],
    queryFn: async () => {
      const res = await api.get(`/physical-tests/progress`, {
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
    mutationFn: async ({ exerciseId, currentValue, completed }) => {
      const res = await api.put('/physical-tests/progress', {
        departmentId: selectedDepartment._id,
        exerciseId,
        currentValue,
        completed,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physicalProgress', selectedDepartment?._id, selectedSubCategory, selectedPosition] });
      setEditingId(null);
    },
    onError: (err) => {
      console.error('Failed to update physical progress:', err);
      alert(err.response?.data?.message || 'Failed to save progress.');
    },
  });

  const handleEditStart = (ex) => {
    setEditingId(ex._id);
    setCurrentVal(ex.currentValue);
    setIsDone(ex.completed);
  };

  const handleSave = (exId) => {
    updateProgressMutation.mutate({
      exerciseId: exId,
      currentValue: currentVal,
      completed: isDone,
    });
  };

  const handleQuickToggle = (ex, checked) => {
    updateProgressMutation.mutate({
      exerciseId: ex._id,
      currentValue: ex.currentValue,
      completed: checked,
    });
  };

  // Guard: No selection
  if (!selectedDepartment || (selectedDepartment.hasSubCategories && (!selectedSubCategory || !selectedPosition))) {
    return (
      <div className="glass-panel p-10 rounded-2xl text-center space-y-5 max-w-lg mx-auto">
        <Lock className="w-12 h-12 text-primary-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Target Selection Required</h2>
        <p className="text-gray-400 text-xs leading-relaxed">
          You must set your active target force department and entry/post before tracking physical training goals.
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
        <p className="text-gray-500 text-sm">Loading physical plan templates...</p>
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

  // Calculate stats
  const exercises = progressData?.exercises || [];
  const completedCount = exercises.filter((ex) => ex.completed).length;
  const totalCount = exercises.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* MOTIVATIONAL HEADER */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/15 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400">
            <Activity className="w-4 h-4" /> Training Schedule
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Physical Preparation Plan: <span className="text-emerald-500">{selectedDepartment?.name}{selectedPosition ? ` - ${selectedPosition}` : ''}</span>
          </h1>
          <p className="text-gray-300 text-base max-w-xl">
            Complete the targets set by selection boards. Keep track of your timing records and reps to secure physical clearance.
          </p>
        </div>

        {/* Circular indicator or Badge */}
        <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-850 flex items-center gap-5 relative z-10 flex-shrink-0">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Training Completed</span>
            <div className="text-2xl font-black text-white">{completedCount} <span className="text-sm text-gray-400 font-semibold">/ {totalCount} Goals</span></div>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 flex items-center justify-center font-bold text-sm text-emerald-400 relative">
            <span className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin-slow pointer-events-none" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* METRIC PROGRESS BAR */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm font-semibold uppercase tracking-wider">
          <span className="text-gray-300">Overall Training Metric</span>
          <span className="font-bold text-emerald-400">{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-850/80">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* WORKOUT LIST GRID */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Core Physical Standards
          </h2>
          <p className="text-gray-300 text-sm mt-1">Click edit to save your current timing metrics and mark tasks complete</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exercises.map((ex) => {
            const isEditing = editingId === ex._id;
            const saving = updateProgressMutation.isPending && editingId === ex._id;

            return (
              <div
                key={ex._id}
                className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between gap-5 ${
                  ex.completed
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-gray-850 hover:border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${ex.completed ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' : 'bg-gray-700'}`} />
                      <h4 className="font-bold text-base text-white">{ex.name}</h4>
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed">
                      Target standard: <span className="text-white font-semibold">{ex.target}</span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={ex.completed}
                    onChange={(e) => handleQuickToggle(ex, e.target.checked)}
                    disabled={updateProgressMutation.isPending}
                    className="w-5 h-5 rounded-md border-gray-800 bg-gray-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                    title="Quick Complete toggle"
                  />
                </div>

                {/* Inline edit card or Display logs */}
                {isEditing ? (
                  <div className="space-y-4 pt-3 border-t border-gray-800/80 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-300 text-xs font-bold tracking-wider mb-1">Your Value</label>
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => setCurrentVal(e.target.value)}
                          placeholder="e.g. 7m 30s or 40 reps"
                          className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex items-end pl-1 pb-1">
                        <label className="flex items-center gap-2 text-sm text-gray-300 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={(e) => setIsDone(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/20"
                          />
                          Mark Completed
                        </label>
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
                        onClick={() => handleSave(ex._id)}
                        disabled={saving}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center gap-1 shadow-md hover:shadow-emerald-500/10 cursor-pointer"
                      >
                        {saving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" /> Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-850/80 text-sm">
                    <span className="text-gray-400">
                      Your performance: <span className="text-gray-200 font-semibold">{ex.currentValue || 'No log yet'}</span>
                    </span>
                    <button
                      onClick={() => handleEditStart(ex)}
                      className="p-2 border border-gray-850 hover:border-gray-800 hover:bg-gray-800/40 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
                      title="Update performance value"
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

export default PhysicalPlan;
