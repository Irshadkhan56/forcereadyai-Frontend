import { useQuery } from '@tanstack/react-query';
import { useSelection } from '../context/SelectionContext';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  Award,
  Building2,
  MessageSquareText,
  Activity,
  HeartPulse,
  ChevronRight,
  TrendingUp,
  Loader2,
  XCircle,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const { selectedDepartment, selectedSubCategory, selectedPosition } = useSelection();

  // Fetch Overall Readiness Score and details
  const { data: readinessData, isLoading, error } = useQuery({
    queryKey: ['readinessScores', selectedDepartment?._id, selectedSubCategory, selectedPosition],
    queryFn: async () => {
      const res = await api.get('/progress/readiness');
      return res.data.data;
    },
    enabled: !!selectedDepartment?._id,
  });

  // Loading Screen
  if (selectedDepartment && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-gray-500 text-sm">Aggregating readiness indices...</p>
      </div>
    );
  }

  // Error Card
  if (selectedDepartment && error) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-red-500/10 text-center text-red-400 space-y-3 max-w-lg mx-auto">
        <XCircle className="w-12 h-12 text-red-500/40 mx-auto" />
        <h3 className="font-bold text-white">Metrics Gathering Failed</h3>
        <p className="text-xs">{error.response?.data?.message || 'Could not fetch calculation results.'}</p>
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

  const activities = [];
  if (details.interviews.totalCompleted > 0) {
    activities.push({
      text: `Completed mock interview board for ${selectedPosition || selectedDepartment?.name || 'target position'}.`,
      meta: `Score: ${progress.interviewReadiness}/100`,
      icon: MessageSquareText,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    });
  }
  if (details.physical.completedExercises > 0) {
    activities.push({
      text: `Logged progress for ${details.physical.completedExercises} training exercises.`,
      meta: `${details.physical.completedExercises} completed, ${details.physical.pendingExercises} pending`,
      icon: Activity,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    });
  }
  if (details.medical.passedCriteria > 0) {
    activities.push({
      text: `Validated medical standards in checkup lists.`,
      meta: `${details.medical.passedCriteria} passed, ${details.medical.failedCriteria} failed`,
      icon: HeartPulse,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    });
  }
  if (activities.length === 0) {
    activities.push({
      text: 'Initialized active recruitment checklist parameters.',
      meta: 'Target set successfully',
      icon: Sparkles,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
    });
  }

  return (
    <div className="space-y-8">
      {/* 1. TOP WELCOME HERO */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-primary-600/10 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-600/10 border border-primary-500/15 rounded-full text-xs font-semibold text-primary-400">
            <TrendingUp className="w-3.5 h-3.5" /> Candidate Readiness Dashboard
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome, <span className="text-primary-500">{user?.name}</span>!
          </h1>
          <p className="text-gray-400 text-sm max-w-xl">
            {selectedDepartment
              ? `Your target track is set to ${selectedDepartment.name}${selectedPosition ? ` (${selectedPosition})` : ''}.`
              : 'Set your target force department to calculate readiness.'}
          </p>
        </div>

        {!selectedDepartment && (
          <Link
            to="/departments"
            className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/20 cursor-pointer relative z-10"
          >
            Start Setup Wizard <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* EXTERNAL PRACTICE LINK CARD */}
      <div className="glass-panel p-4 rounded-xl border border-primary-500/20 bg-gradient-to-r from-primary-950/10 to-purple-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-primary-600/15 border border-primary-500/25 flex items-center justify-center text-primary-400 flex-shrink-0">
            <Award className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Academic & Intelligence Test Practice</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">Prepare for Verbal, Non-Verbal, and Academic intelligence tests here.</p>
          </div>
        </div>
        <a
          href="https://smart-prep-ai-jet.vercel.app" 
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-primary-500/30 hover:border-primary-500 bg-primary-500/10 hover:bg-primary-500/20 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
        >
          Practice Intelligence Tests <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {selectedDepartment ? (
        <>
          {/* 2. THREE-DIMENSIONAL SCORES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Interview score card */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-850 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interview Readiness</span>
                <MessageSquareText className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white">{progress.interviewReadiness}%</span>
                <span className="text-xs text-gray-500">avg mock</span>
              </div>
              <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progress.interviewReadiness}%` }} />
              </div>
              <div className="text-[10px] text-gray-500 flex justify-between">
                <span>Completed: {details.interviews.totalCompleted} sessions</span>
                <Link to={`/department/${selectedDepartment.slug}/interview`} className="text-purple-400 hover:text-purple-300 font-bold flex items-center">
                  Practice <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Physical score card */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-850 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Physical Preparation</span>
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white">{progress.physicalReadiness}%</span>
                <span className="text-xs text-gray-500">completed</span>
              </div>
              <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress.physicalReadiness}%` }} />
              </div>
              <div className="text-[10px] text-gray-500 flex justify-between">
                <span>Goals met: {details.physical.completedExercises} of {details.physical.totalExercises}</span>
                <Link to={`/department/${selectedDepartment.slug}/physical`} className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center">
                  Workouts <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Medical score card */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-850 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Medical Pre-checks</span>
                <HeartPulse className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white">{progress.medicalReadiness}%</span>
                <span className="text-xs text-gray-500">passed</span>
              </div>
              <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${progress.medicalReadiness}%` }} />
              </div>
              <div className="text-[10px] text-gray-500 flex justify-between">
                <span>Verified: {details.medical.passedCriteria} of {details.medical.totalCriteria}</span>
                <Link to={`/department/${selectedDepartment.slug}/medical`} className="text-rose-400 hover:text-rose-300 font-bold flex items-center">
                  Checklist <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 3. PERFORMANCE CHART & ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-850 space-y-6">
              <div>
                <h3 className="font-bold text-white text-base">Weighted Preparation Performance</h3>
                <p className="text-gray-500 text-xs mt-0.5">Calculated comparing individual index metrics</p>
              </div>

              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-300">Mock Board Interviews (40% weight)</span>
                    <span className="text-purple-400 font-bold">{progress.interviewReadiness}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-900 rounded-lg overflow-hidden border border-gray-850/80 flex">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg transition-all duration-500"
                      style={{ width: `${progress.interviewReadiness}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-300">Physical Conditioning Tests (40% weight)</span>
                    <span className="text-emerald-400 font-bold">{progress.physicalReadiness}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-900 rounded-lg overflow-hidden border border-gray-850/80 flex">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg transition-all duration-500"
                      style={{ width: `${progress.physicalReadiness}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-300">Medical Requirements Check (20% weight)</span>
                    <span className="text-rose-400 font-bold">{progress.medicalReadiness}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-900 rounded-lg overflow-hidden border border-gray-850/80 flex">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-lg transition-all duration-500"
                      style={{ width: `${progress.medicalReadiness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-850 space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-500" /> Recent Activity
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">Live training logs entries</p>
                </div>

                <div className="space-y-4">
                  {activities.map((act, idx) => {
                    const Icon = act.icon;
                    return (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${act.color} flex-shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-200 leading-normal">{act.text}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{act.meta}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Link
                to={`/department/${selectedDepartment.slug}`}
                className="w-full bg-gray-900 border border-gray-800 hover:border-gray-750 text-gray-400 hover:text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                Open Department Hub <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </>
      ) : (
        /* Empty state when no target force has been selected */
        <div className="glass-panel p-10 rounded-2xl border border-gray-850 text-center space-y-5 max-w-lg mx-auto py-16">
          <Award className="w-12 h-12 text-gray-700 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Target Parameters Empty</h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
              Please select your target force department to begin tracking your recruitment readiness index.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/departments"
              className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-primary-500/20"
            >
              Select Target Department <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
