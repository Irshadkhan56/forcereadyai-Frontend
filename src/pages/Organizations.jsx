import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelection } from '../context/SelectionContext';
import api from '../services/api';
import {
  Building2,
  BookOpen,
  Compass,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  HelpCircle,
} from 'lucide-react';

const Organizations = () => {
  const navigate = useNavigate();
  const {
    selectedOrg,
    selectedCategory,
    selectedPosition,
    selectOrg,
    selectCategory,
    selectPosition,
    clearSelection,
  } = useSelection();

  // Wizard active step: 1 (Org), 2 (Category), 3 (Position), 4 (Summary)
  const [step, setStep] = useState(1);

  // Temp selections (committed only on final confirm)
  // Start null so the wizard always begins from step 1 with fresh data.
  const [tempOrg, setTempOrg] = useState(null);
  const [tempCategory, setTempCategory] = useState(null);
  const [tempPosition, setTempPosition] = useState(null);

  // Custom position state
  const [customPositionName, setCustomPositionName] = useState('');
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [generationError, setGenerationError] = useState('');

  // ─── DATA FETCHING ───────────────────────────────────────────────────────

  const queryClient = useQueryClient();

  // On mount: clear any stale localStorage selections AND React Query cache.
  // This ensures that after a backend restart or DB reseed, the wizard
  // always fetches fresh IDs from the live database.
  useEffect(() => {
    clearSelection();
    queryClient.clear();
  }, []);

  // Step 1: All organizations — always fetch fresh
  const { data: orgsData, isLoading: loadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await api.get('/organizations');
      return res.data.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  // Step 2: Categories filtered by org — always fetch fresh
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories', tempOrg?._id],
    queryFn: async () => {
      if (!tempOrg?._id) return [];
      const res = await api.get(`/categories/${tempOrg._id}`);
      return res.data.data;
    },
    enabled: !!tempOrg?._id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  // Step 3: Positions filtered by category + org — always fetch fresh
  const { data: positionsData, isLoading: loadingPositions } = useQuery({
    queryKey: ['positions', tempCategory?._id, tempOrg?._id],
    queryFn: async () => {
      if (!tempCategory?._id || !tempOrg?._id) return [];
      const res = await api.get(
        `/positions/category/${tempCategory._id}?orgId=${tempOrg._id}`
      );
      return res.data.data;
    },
    enabled: !!tempCategory?._id && !!tempOrg?._id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  // ─── HANDLERS ────────────────────────────────────────────────────────────

  const handleSelectOrg = (org) => {
    setTempOrg(org);
    // Reset downstream selections when org changes
    setTempCategory(null);
    setTempPosition(null);
    setCustomPositionName('');
    setGenerationError('');
  };

  const handleSelectCategory = (cat) => {
    setTempCategory(cat);
    // Reset downstream selections when category changes
    setTempPosition(null);
    setCustomPositionName('');
    setGenerationError('');
  };

  const handleNextStep = () => {
    if (step === 1 && tempOrg) setStep(2);
    else if (step === 2 && tempCategory) setStep(3);
  };

  const handlePrevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleCustomPositionChange = (name) => {
    setCustomPositionName(name);
    if (name.trim()) {
      setTempPosition({ name: name.trim(), isCustom: true });
    } else {
      setTempPosition(null);
    }
  };

  const handleConfirm = async () => {
    if (!tempOrg || !tempCategory || !tempPosition) return;

    if (tempPosition.isCustom) {
      setIsGeneratingProfile(true);
      setGenerationError('');
      try {
        const res = await api.post('/positions/custom', {
          organizationId: tempOrg._id,
          categoryId: tempCategory._id,
          positionName: tempPosition.name,
        });
        const realPosition = res.data.data;
        selectOrg(tempOrg);
        selectCategory(tempCategory);
        selectPosition(realPosition);
        setStep(4);
      } catch (err) {
        console.error('Failed to generate AI preparation profile:', err);
        setGenerationError(
          err.response?.data?.message ||
            'Failed to generate AI preparation profile. Please check your connection or try again.'
        );
      } finally {
        setIsGeneratingProfile(false);
      }
    } else {
      selectOrg(tempOrg);
      selectCategory(tempCategory);
      selectPosition(tempPosition);
      setStep(4);
    }
  };

  const handleFinish = () => navigate('/interviews');

  // ─── UI HELPERS ──────────────────────────────────────────────────────────

  const steps = [
    { num: 1, label: 'Agency' },
    { num: 2, label: 'Category' },
    { num: 3, label: 'Position' },
    { num: 4, label: 'Summary' },
  ];

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Target Position Wizard</h1>
        <p className="text-gray-400 text-xs mt-1">
          Configure your active targets to customize AI interview prompts, checklists, and workouts
        </p>
      </div>

      {/* STEP INDICATORS */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-gray-800/80">
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? 'bg-primary-600 text-white ring-4 ring-primary-500/20'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-900 border border-gray-800 text-gray-500'
                  }`}
                >
                  {s.num}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:inline ${
                    step === s.num ? 'text-white font-bold' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="w-12 md:w-20 h-[1px] bg-gray-800/80 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WIZARD PANELS */}
      <div className="min-h-[350px] relative">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: SELECT ORGANIZATION ── */}
          {step === 1 && (
            <motion.div key="step1" {...pageTransition} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Select Target Force Agency</h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Select the government, defense, or law enforcement agency
                  </p>
                </div>
              </div>

              {loadingOrgs ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  <p className="text-gray-500 text-sm">Loading agencies...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {orgsData?.map((org) => {
                    const isSelected = tempOrg?._id === org._id;
                    return (
                      <button
                        key={org._id}
                        onClick={() => handleSelectOrg(org)}
                        className={`glass-card p-5 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary-500/60 bg-primary-500/10 shadow-lg shadow-primary-500/5'
                            : 'border-gray-850 hover:border-gray-800 bg-gray-900/20'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            isSelected
                              ? 'bg-primary-500/20 text-primary-400'
                              : 'bg-gray-900 text-gray-500 border border-gray-800'
                          }`}
                        >
                          {org.name.charAt(0)}
                        </div>
                        <div className="text-xs font-bold text-white">{org.name}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-900/50">
                <button
                  disabled={!tempOrg}
                  onClick={handleNextStep}
                  className="px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-primary-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: SELECT CATEGORY (filtered by org) ── */}
          {step === 2 && (
            <motion.div key="step2" {...pageTransition} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Select Commissioning Category</h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Categories available under{' '}
                    <span className="text-purple-400 font-semibold">{tempOrg?.name}</span>
                  </p>
                </div>
              </div>

              {loadingCategories ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="text-gray-500 text-sm">Loading categories for {tempOrg?.name}...</p>
                </div>
              ) : categoriesData?.length === 0 ? (
                <div className="glass-panel p-6 rounded-2xl border border-gray-800 text-center space-y-3">
                  <HelpCircle className="w-10 h-10 text-purple-400 mx-auto" />
                  <p className="text-white font-bold text-sm">No categories found</p>
                  <p className="text-gray-500 text-xs">
                    No categories are configured for{' '}
                    <span className="text-white font-semibold">{tempOrg?.name}</span> yet.
                    <br />
                    Please re-run the database seed or contact the administrator.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {categoriesData?.map((cat) => {
                    const isSelected = tempCategory?._id === cat._id;
                    return (
                      <button
                        key={cat._id}
                        onClick={() => handleSelectCategory(cat)}
                        className={`glass-card p-5 rounded-2xl border text-left flex gap-4 transition-all cursor-pointer items-start ${
                          isSelected
                            ? 'border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/5'
                            : 'border-gray-850 hover:border-gray-800 bg-gray-900/20'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                            isSelected
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-gray-900 text-gray-500 border border-gray-800'
                          }`}
                        >
                          {cat.name.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white">{cat.name}</h4>
                          <p className="text-[10px] text-gray-500 leading-relaxed truncate max-w-[160px]">
                            {cat.description || 'No description available'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-900/50">
                <button
                  onClick={handlePrevStep}
                  className="px-5 py-3 border border-gray-800 hover:border-gray-700 bg-gray-900/40 text-gray-400 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={!tempCategory}
                  onClick={handleNextStep}
                  className="px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-primary-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: SELECT POSITION (filtered by category + org) ── */}
          {step === 3 && (
            <motion.div key="step3" {...pageTransition} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Select Specific Post Entry</h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Positions under{' '}
                    <span className="text-emerald-400 font-semibold">{tempOrg?.name}</span>
                    {' → '}
                    <span className="text-emerald-400 font-semibold">{tempCategory?.name}</span>
                  </p>
                </div>
              </div>

              {isGeneratingProfile ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 glass-panel rounded-2xl border border-gray-800">
                  <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                  <div className="text-center space-y-1 max-w-md px-4">
                    <h4 className="font-bold text-white text-sm">
                      Generating AI Career Preparation Profile...
                    </h4>
                    <p className="text-gray-500 text-[10px] leading-relaxed">
                      Compiling a customized training track for{' '}
                      <span className="text-primary-400 font-semibold">{tempPosition?.name}</span>{' '}
                      containing 20 mock board questions, workout schedules, and medical checklists.
                      This takes 15–30 seconds.
                    </p>
                  </div>
                </div>
              ) : loadingPositions ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-gray-500 text-sm">Querying matching posts...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pre-seeded positions grid */}
                  {positionsData && positionsData.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {positionsData.map((pos) => {
                        const isSelected = tempPosition?._id === pos._id;
                        return (
                          <button
                            key={pos._id}
                            type="button"
                            onClick={() => {
                              setTempPosition(pos);
                              setCustomPositionName('');
                            }}
                            className={`glass-card p-5 rounded-2xl border text-left flex gap-4 transition-all cursor-pointer items-start ${
                              isSelected
                                ? 'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                                : 'border-gray-850 hover:border-gray-800 bg-gray-900/20'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                                isSelected
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-gray-900 text-gray-500 border border-gray-800'
                              }`}
                            >
                              {pos.name.charAt(0)}
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white">{pos.name}</h4>
                              <p className="text-[10px] text-gray-500 leading-relaxed truncate max-w-[200px]">
                                {pos.description || 'No details provided'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Custom position input — always visible */}
                  <div
                    className={`border-t border-gray-900/50 pt-4 ${
                      positionsData?.length === 0 ? 'border-t-0 pt-0' : ''
                    }`}
                  >
                    {positionsData?.length === 0 && (
                      <div className="flex flex-col items-center gap-2 mb-4">
                        <HelpCircle className="w-8 h-8 text-primary-400" />
                        <p className="text-white font-bold text-sm text-center">
                          No pre-defined positions found
                        </p>
                        <p className="text-gray-400 text-xs text-center max-w-sm">
                          No positions are pre-configured under{' '}
                          <span className="text-white font-semibold">{tempOrg?.name}</span> →{' '}
                          <span className="text-white font-semibold">{tempCategory?.name}</span>.
                          You can still train for any custom post below.
                        </p>
                      </div>
                    )}

                    {positionsData?.length > 0 && (
                      <p className="text-xs text-gray-500 text-center mb-3">
                        Or prepare for a custom position not listed above:
                      </p>
                    )}

                    {generationError && (
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-xs mb-3">
                        {generationError}
                      </div>
                    )}

                    <div className="max-w-md mx-auto space-y-2">
                      <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                        Specify Your Target Post Name
                      </label>
                      <input
                        type="text"
                        value={customPositionName}
                        onChange={(e) => handleCustomPositionChange(e.target.value)}
                        placeholder="e.g. Soldier, Sub-Inspector, GD Pilot..."
                        className="w-full bg-gray-950/40 text-xs text-white placeholder-gray-700 rounded-xl p-3 border border-gray-800 focus:border-primary-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-900/50">
                <button
                  type="button"
                  disabled={isGeneratingProfile}
                  onClick={handlePrevStep}
                  className="px-5 py-3 border border-gray-800 hover:border-gray-700 bg-gray-900/40 text-gray-400 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!tempPosition || isGeneratingProfile}
                  onClick={handleConfirm}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  Confirm Selection <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: CONFIRMATION SUMMARY ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              {...pageTransition}
              className="space-y-8 text-center max-w-lg mx-auto py-6"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Target Position Confirmed!</h2>
                <p className="text-gray-500 text-xs">Your target parameters have been successfully set.</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-gray-850 space-y-3.5 text-left">
                <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                  <span className="text-gray-500 text-xs font-semibold uppercase">Agency Force</span>
                  <span className="text-white text-xs font-bold">{tempOrg?.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                  <span className="text-gray-500 text-xs font-semibold uppercase">Category</span>
                  <span className="text-white text-xs font-bold">{tempCategory?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs font-semibold uppercase">Specific Position</span>
                  <span className="text-primary-400 text-xs font-bold">{tempPosition?.name}</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg hover:shadow-primary-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Start Mock Interviews <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Organizations;
