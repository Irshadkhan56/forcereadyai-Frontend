import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  FaAward,
  FaComments,
  FaRunning,
  FaHeartbeat,
  FaChevronRight,
  FaSpinner,
  FaExclamationCircle,
  FaChartLine,
  FaArrowLeft,
  FaCog,
} from 'react-icons/fa';
import { FaShieldHalved } from 'react-icons/fa6';

const ReadinessHub = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    selectedDepartment,
    selectedSubCategory,
    selectedPosition,
    selectDepartment,
  } = useSelection();

  // 1. Fetch Department Details by Slug
  const { data: department, isLoading: loadingDept, error: deptError } = useQuery({
    queryKey: ['departmentDetails', slug],
    queryFn: async () => {
      const res = await api.get(`/departments/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  // 2. Auto-activate department selection
  useEffect(() => {
    if (department && selectedDepartment?._id !== department._id) {
      if (department.hasSubCategories) {
        // Army has sub-categories; requires completing the wizard first
        navigate('/departments');
      } else {
        // Auto-select for direct departments
        selectDepartment(department);
      }
    }
  }, [department, selectedDepartment, navigate, selectDepartment]);

  // 3. Fetch Readiness Score filtered by this department/track
  const { data: readinessData, isLoading: loadingReadiness, error: readinessError } = useQuery({
    queryKey: ['readinessScores', department?._id, selectedSubCategory, selectedPosition],
    queryFn: async () => {
      const res = await api.get('/progress/readiness', {
        params: {
          departmentId: department._id,
          subCategory: selectedSubCategory,
          position: selectedPosition,
        },
      });
      return res.data.data;
    },
    enabled: !!department?._id,
  });

  if (loadingDept || loadingReadiness) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-gray-400 text-base">Gathering department statistics...</p>
      </div>
    );
  }

  if (deptError || !department) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-red-500/10 text-center text-red-400 space-y-3 max-w-lg mx-auto">
        <FaExclamationCircle className="w-12 h-12 text-red-500/40 mx-auto" />
        <h3 className="font-bold text-white">Department Not Found</h3>
        <p className="text-sm text-gray-300">The department slug you requested does not exist or has been deactivated.</p>
        <Link to="/departments" className="mt-4 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm hover:bg-gray-800 inline-flex items-center gap-1.5">
          <FaArrowLeft className="w-4 h-4" /> Back to Departments
        </Link>
      </div>
    );
  }

  const progress = readinessData?.progress || {
    overallReadiness: 0,
    interviewReadiness: 0,
    physicalReadiness: 0,
    medicalReadiness: 0,
  };

  const details = readinessData?.details || {
    interviews: { totalCompleted: 0, averageScore: 0 },
    physical: { totalExercises: 0, completedExercises: 0, pendingExercises: 0 },
    medical: { totalCriteria: 0, passedCriteria: 0, failedCriteria: 0, uncheckedCriteria: 0 },
  };

  // SVG circular progress settings
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.overallReadiness / 100) * circumference;

  let alertRecommendation = `Standard recommendation track active for ${department.name}.`;
  if (details.medical.failedCriteria > 0) {
    alertRecommendation = `Attention: You have ${details.medical.failedCriteria} failed medical checklist criteria. Review guidelines and consult medical officers.`;
  } else if (progress.overallReadiness < 60) {
    alertRecommendation = "Advice: Your overall readiness is below 60%. Take mock interviews and log completed physical workouts to boost your score.";
  } else {
    alertRecommendation = "Status: Strong progress! Maintain consistent physical logs and score targets to qualify.";
  }

  return (
    <div className="space-y-8">
      {/* DEPARTMENT TOP BANNER */}
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl flex items-end">
        <img
          src={department.banner || 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=1200'}
          alt="Department Banner"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white font-extrabold text-2xl shadow-xl flex-shrink-0">
              {department.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-white">{department.name}</h1>
              <p className="text-sm text-gray-300 max-w-xl line-clamp-2 mt-1">{department.description}</p>
            </div>
          </div>
          {department.hasSubCategories && (
            <Link
              to="/departments"
              className="flex items-center gap-1.5 px-4 py-2.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all w-fit self-end md:self-auto cursor-pointer"
            >
              <FaCog className="w-4 h-4" /> Change Post ({selectedPosition || 'None'})
            </Link>
          )}
        </div>
      </div>

      {/* METRICS & GAUGE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Readiness Index circular gauge */}
        <div className="glass-panel p-8 rounded-2xl border border-gray-850 flex flex-col items-center justify-center text-center space-y-5">
          <div>
            <h3 className="font-extrabold text-white text-base">Overall Preparedness</h3>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mt-0.5">
              {selectedPosition || 'General Standard'}
            </p>
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="url(#deptGrad)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="deptGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-black text-white">{progress.overallReadiness}%</span>
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Index</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 leading-normal border-t border-gray-850 pt-4 w-full">
            Weighted metrics: <br />
            <span className="text-gray-300 font-semibold">40% Interview + 40% Physical + 20% Medical</span>
          </div>
        </div>

        {/* Breakdown of Prep Modules */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm leading-normal font-semibold ${
            details.medical.failedCriteria > 0
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : progress.overallReadiness < 60
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <FaChartLine className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{alertRecommendation}</span>
          </div>

          {/* Cards for each track */}
          <div className="space-y-4">
            {/* 1. Interview practice */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <FaComments className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Interview Practice</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Mock questions and AI verbal evaluation</p>
                </div>
              </div>
              <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-850 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-xs text-gray-400 block uppercase font-bold">Mock Average</span>
                  <span className="text-sm font-bold text-purple-400">{progress.interviewReadiness}% score</span>
                </div>
                <Link to={`/department/${slug}/interview`} className="p-2 border border-gray-850 hover:border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer">
                  <FaChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 2. Physical Practice */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <FaRunning className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Physical Preparation</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Physical test targets and workout logging</p>
                </div>
              </div>
              <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-850 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-xs text-gray-400 block uppercase font-bold">Training Completion</span>
                  <span className="text-sm font-bold text-emerald-400">{progress.physicalReadiness}% goals met</span>
                </div>
                <Link to={`/department/${slug}/physical`} className="p-2 border border-gray-850 hover:border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer">
                  <FaChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 3. Medical checklist */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <FaHeartbeat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Medical Checklist</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Medical fitness checklist pre-validation</p>
                </div>
              </div>
              <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-850 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-xs text-gray-400 block uppercase font-bold">Pre-check Status</span>
                  <span className="text-sm font-bold text-rose-400">{progress.medicalReadiness}% passed</span>
                </div>
                <Link to={`/department/${slug}/medical`} className="p-2 border border-gray-850 hover:border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer">
                  <FaChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessHub;
