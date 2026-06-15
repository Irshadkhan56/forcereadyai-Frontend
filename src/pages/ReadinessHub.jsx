import { useQuery } from '@tanstack/react-query';
import { useSelection } from '../context/SelectionContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  Award,
  MessageSquareText,
  Activity,
  HeartPulse,
  ChevronRight,
  Loader2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Lock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const ReadinessHub = () => {
  const { selectedPosition } = useSelection();

  // Fetch Overall Readiness Score and details
  const { data: readinessData, isLoading, error } = useQuery({
    queryKey: ['readinessScores', selectedPosition?._id],
    queryFn: async () => {
      const res = await api.get('/progress/readiness');
      return res.data.data;
    },
    enabled: !!selectedPosition?._id,
  });

  // Guard: No selection
  if (!selectedPosition) {
    return (
      <div className="glass-panel p-10 rounded-2xl text-center space-y-5 max-w-lg mx-auto">
        <Lock className="w-12 h-12 text-primary-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Target Position Required</h2>
        <p className="text-gray-400 text-xs leading-relaxed">
          You must set your active target force position before reviewing your overall readiness scorecard.
        </p>
        <div className="pt-2">
          <Link
            to="/organizations"
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
        <p className="text-gray-500 text-sm">Gathering readiness statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-red-500/10 text-center text-red-400 space-y-3 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500/40 mx-auto" />
        <h3 className="font-bold text-white">Hub Loading Failed</h3>
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

  // SVG circular properties
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.overallReadiness / 100) * circumference;

  // Recommendations generator
  let alertRecommendation = null;
  if (details.medical.failedCriteria > 0) {
    alertRecommendation = `Attention: You have ${details.medical.failedCriteria} failed medical standard(s) (e.g. vision or chest requirements). Review the checklist logs carefully and consult a doctor.`;
  } else if (progress.overallReadiness < 60) {
    alertRecommendation = "Advice: Your overall readiness score is below 60%. Engage in more AI Mock Interviews and mark physical tasks as complete to boost your profile.";
  } else {
    alertRecommendation = "Candidate Status: Excellent progress! Keep maintaining your workouts and mock scores to ensure final board recommendation.";
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Forces Readiness Index</h1>
        <p className="text-gray-400 text-xs mt-1">Weighted evaluation score calculated dynamically based on target standards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT CARD: Overall Readiness Gauge */}
        <div className="glass-panel p-8 rounded-2xl border border-gray-850 space-y-6 text-center flex flex-col items-center">
          <div>
            <h3 className="font-bold text-white text-base">Overall Preparedness</h3>
            <p className="text-gray-500 text-xs mt-0.5">{selectedPosition.name} standard</p>
          </div>

          {/* SVG Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Progress ring */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="url(#grad)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-white">{progress.overallReadiness}%</span>
              <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Index</span>
            </div>
          </div>

          {/* Formula info */}
          <div className="text-[10px] text-gray-500 leading-relaxed max-w-[200px] border-t border-gray-850 pt-4 w-full">
            Readiness formula: <br />
            <span className="text-gray-400 font-semibold">40% Interview + 40% Physical + 20% Medical Check</span>
          </div>
        </div>

        {/* RIGHT CARDS: Detailed breakdown & guidelines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommendation Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-normal font-semibold ${
            details.medical.failedCriteria > 0
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : progress.overallReadiness < 60
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{alertRecommendation}</span>
          </div>

          {/* Detailed breakdowns */}
          <div className="space-y-4">
            {/* 1. Interview section */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">AI Mock Interview Board</h4>
                  <p className="text-xs text-gray-500">Total Completed: {details.interviews.totalCompleted} sessions</p>
                </div>
              </div>
              <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-850 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Mock Average</span>
                  <span className="text-sm font-bold text-purple-400">{progress.interviewReadiness}% score</span>
                </div>
                <Link to="/interviews" className="p-2 border border-gray-850 hover:border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 2. Physical section */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">Physical Training Goals</h4>
                  <p className="text-xs text-gray-500">Completed Exercises: {details.physical.completedExercises} of {details.physical.totalExercises}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-850 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Training Completion</span>
                  <span className="text-sm font-bold text-emerald-400">{progress.physicalReadiness}% goals met</span>
                </div>
                <Link to="/progress/physical" className="p-2 border border-gray-850 hover:border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 3. Medical section */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">Medical Checklist Standards</h4>
                  <p className="text-xs text-gray-500">Passed: {details.medical.passedCriteria} | Failed: {details.medical.failedCriteria} | Unchecked: {details.medical.uncheckedCriteria}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-850 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Pre-validation Rate</span>
                  <span className="text-sm font-bold text-rose-400">{progress.medicalReadiness}% passed</span>
                </div>
                <Link to="/progress/medical" className="p-2 border border-gray-850 hover:border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
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
