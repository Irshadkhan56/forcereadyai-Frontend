import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  const { selectDepartment, selectSubCategory, selectPosition } = useSelection();

  // Wizard active step: 1 (Dept), 2 (Army Category), 3 (Army Position), 4 (Summary)
  const [step, setStep] = useState(1);
  const [tempDept, setTempDept] = useState(null);
  const [tempSub, setTempSub] = useState('');
  const [tempPos, setTempPos] = useState('');

  // Custom position state
  const [customPositionName, setCustomPositionName] = useState('');

  // Step 1: All departments
  const { data: deptsData, isLoading: loadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data.data;
    },
  });

  const handleSelectDept = (dept) => {
    setTempDept(dept);
    setTempSub('');
    setTempPos('');
    setCustomPositionName('');

    if (dept.hasSubCategories) {
      // Go to subcategory selection for Army
      setStep(2);
    } else {
      // Instantly confirm for other departments
      selectDepartment(dept);
      selectSubCategory('');
      selectPosition('');
      navigate(`/department/${dept.slug}`);
    }
  };

  const handleSelectSub = (sub) => {
    setTempSub(sub);
    setTempPos('');
    setCustomPositionName('');
    setStep(3);
  };

  const handleSelectPos = (pos) => {
    setTempPos(pos);
    setCustomPositionName('');
  };

  const handleCustomPosChange = (name) => {
    setCustomPositionName(name);
    setTempPos(name.trim());
  };

  const handleConfirmArmy = () => {
    if (!tempDept || !tempSub || !tempPos) return;

    selectDepartment(tempDept);
    selectSubCategory(tempSub);
    selectPosition(tempPos);
    setStep(4);
  };

  const handleFinish = () => {
    navigate(`/department/${tempDept.slug}`);
  };

  // Army subcategory lists
  const armySubs = [
    { name: 'Officer', description: 'Commissioned officers leading combat, support, or tech divisions.' },
    { name: 'Soldier', description: 'Enlisted personnel, fighting arms, clerks, and technical trades.' },
  ];

  // Army positions
  const armyPositions = tempSub === 'Officer'
    ? ['PMA Long Course', 'Lady Cadet Course (LCC)', 'Technical Cadet Course (TCC)', 'Short Service Commission']
    : ['General Duty Soldier', 'Clerk', 'Driver', 'Military Police', 'Technical Trade'];

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.25 },
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Target Preparation Track</h1>
        <p className="text-gray-400 text-sm mt-1">
          Select your target force department to load customized psychological tests, workouts, and medical checklists.
        </p>
      </div>

      {/* STEP INDICATORS (Only visible when selecting Army track) */}
      {tempDept?.hasSubCategories && (
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-gray-880/80">
          <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Department' },
              { num: 2, label: 'Entry Class' },
              { num: 3, label: 'Target Post' },
              { num: 4, label: 'Ready' },
            ].map((s) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
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
                    className={`text-sm font-semibold hidden sm:inline ${
                      step === s.num ? 'text-white font-bold' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {s.num < 4 && <div className="w-12 md:w-20 h-[1px] bg-gray-800/80 mx-2" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PANELS */}
      <div className="min-h-[350px] relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT DEPARTMENT */}
          {step === 1 && (
            <motion.div key="step1" {...pageTransition} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Select Force / Department</h2>
                  <p className="text-gray-400 text-sm mt-0.5">Select your targeted service line</p>
                </div>
              </div>

              {loadingDepts ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  <p className="text-gray-500 text-sm">Loading departments...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {deptsData?.map((dept) => (
                    <button
                      key={dept._id}
                      onClick={() => handleSelectDept(dept)}
                      className="glass-card p-5 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-900 border border-gray-800 text-primary-500 font-black">
                        {dept.name.charAt(0)}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-white truncate">{dept.name}</h4>
                        <p className="text-xs text-gray-400 leading-normal line-clamp-2">
                          {dept.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: SELECT ARMY SUBCATEGORY */}
          {step === 2 && (
            <motion.div key="step2" {...pageTransition} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Select Entry Level</h2>
                  <p className="text-gray-400 text-sm mt-0.5">Select commissions or enlisted soldiers tracks</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {armySubs.map((sub) => {
                  const isSelected = tempSub === sub.name;
                  return (
                    <button
                      key={sub.name}
                      onClick={() => handleSelectSub(sub.name)}
                      className={`glass-card p-6 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-500/60 bg-purple-500/10'
                          : 'border-gray-850 hover:border-gray-800'
                      }`}
                    >
                      <h4 className="text-base font-bold text-white">{sub.name} Entry</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{sub.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-900/50">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 border border-gray-800 hover:border-gray-750 text-gray-400 hover:text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SELECT ARMY POSITION */}
          {step === 3 && (
            <motion.div key="step3" {...pageTransition} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Select Specific Post</h2>
                  <p className="text-gray-400 text-sm mt-0.5">Select targeted job post</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {armyPositions.map((pos) => {
                    const isSelected = tempPos === pos;
                    return (
                      <button
                        key={pos}
                        onClick={() => handleSelectPos(pos)}
                        className={`glass-card p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500/60 bg-emerald-500/10 text-white font-bold'
                            : 'border-gray-850 hover:border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span className="text-sm font-bold">{pos}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-gray-900/50 pt-4 max-w-md mx-auto space-y-2">
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Or specify a custom post name:
                  </label>
                  <input
                    type="text"
                    value={customPositionName}
                    onChange={(e) => handleCustomPosChange(e.target.value)}
                    placeholder="e.g. Signals Officer, Commando..."
                    className="w-full bg-gray-950/40 text-sm text-white placeholder-gray-700 rounded-xl p-3 border border-gray-800 focus:border-primary-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-900/50">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-3 border border-gray-800 hover:border-gray-750 text-gray-400 hover:text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={!tempPos}
                  onClick={handleConfirmArmy}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  Confirm Selection <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONFIRMATION SUMMARY */}
          {step === 4 && (
            <motion.div key="step4" {...pageTransition} className="space-y-8 text-center max-w-lg mx-auto py-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Target Track Confirmed!</h2>
                <p className="text-gray-400 text-sm">Your army target parameters have been successfully set.</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-gray-850 space-y-3.5 text-left">
                <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                  <span className="text-gray-400 text-sm font-semibold uppercase">Department</span>
                  <span className="text-white text-sm font-bold">{tempDept?.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                  <span className="text-gray-400 text-sm font-semibold uppercase">Category</span>
                  <span className="text-white text-sm font-bold">{tempSub} Entry</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-semibold uppercase">Target post</span>
                  <span className="text-primary-400 text-sm font-bold">{tempPos}</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl text-base transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Go to Department Hub <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Organizations;
