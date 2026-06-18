import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  MessageSquareText,
  Activity,
  HeartPulse,
  Award,
  Star,
  Users,
  CheckCircle,
  TrendingUp,
  Sun,
  Moon,
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const Landing = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users directly to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Sync theme selection to HTML class List and localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 100 } },
  };

  const features = [
    {
      title: 'AI Mock Interviews',
      description: 'Engage with custom interview questions generated dynamically by Gemini API for your targeted rank and department.',
      icon: MessageSquareText,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Physical Conditioning Plans',
      description: 'Compare against physical standards for running, push-ups, chin-ups, and log your training milestones.',
      icon: Activity,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Medical Standards Checklist',
      description: 'Crosscheck your height, vision, chest expansion, and physical criteria before clinical military inspection.',
      icon: HeartPulse,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Readiness Index Hub',
      description: 'A 40-40-20 weighted readiness score evaluating your interview mock average, physical tasks, and medical stats.',
      icon: Award,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  const orgs = [
    { name: 'Pakistan Army', desc: 'Officer Commission / Soldiers' },
    { name: 'Pakistan Navy', desc: 'Operations / Tech Cadres' },
    { name: 'Pakistan Air Force', desc: 'GD Pilot / Airmen' },
    { name: 'Pakistan Police', desc: 'Constable / Inspector Tracks' },
    { name: 'FIA', desc: 'Federal Investigation Agency' },
    { name: 'CTD', desc: 'Counter Terrorism Department' },
    { name: 'ANF', desc: 'Anti-Narcotics Force' },
    { name: 'ASF', desc: 'Airport Security Force' },
    { name: 'Customs', desc: 'Appraising Officers / Inspectors' },
    { name: 'Intelligence Bureau', desc: 'Security Assistant / Officer' },
  ];

  const testimonials = [
    {
      quote: "The AI interview feedback helped me structure my responses perfectly. I cleared the ISSB recommendation list!",
      author: "Asim Bajwa",
      force: "Pakistan Army (Officer Cadet)",
      rating: 5,
    },
    {
      quote: "Tracking running times and push-up sets daily kept me motivated. Passed the physical test on my first attempt.",
      author: "Zainab Malik",
      force: "FIA (Sub-Inspector)",
      rating: 5,
    },
    {
      quote: "Outstanding tool for checking medical standards. The checklist let me pre-validate chest and vision stats.",
      author: "Hamza Abbasi",
      force: "Pakistan Air Force (GD Pilot)",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 flex flex-col relative overflow-hidden">
      {/* BACKGROUND GRAPHICS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-600/10 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="ForceReady.AI Logo" className="h-24 w-auto" />
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 border border-gray-800 hover:border-gray-750 bg-gray-900/40 hover:bg-gray-900/60 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-800 hover:border-gray-700 bg-gray-900/60 rounded-xl text-sm font-semibold transition-all"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/35 text-red-400 hover:text-red-300 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-all">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-primary-500/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-16 pb-24 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-600/10 border border-primary-500/15 rounded-full text-xs font-semibold text-primary-400 tracking-wide uppercase mx-auto">
            <TrendingUp className="w-3.5 h-3.5" /> Next-Gen Forces Recruitment Prep
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            Secure Your Commission with <span className="text-gradient">AI-Powered Smart Interview</span> Prep
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            The ultimate simulation and progress hub for candidates preparing for ISSB, police boards, intelligence bureaus, and armed forces entry stages.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            Create Your Account <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 border border-gray-800 hover:border-gray-700 bg-gray-900/40 hover:bg-gray-900/60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Candidate Sign In
          </Link>
        </motion.div>

        {/* Floating visual representation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="pt-10 max-w-5xl mx-auto"
        >
          <div className="glass-panel p-2 rounded-2xl shadow-3xl border border-gray-800/60 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="bg-gray-950/45 dark:bg-dark-900 rounded-xl p-8 text-left grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-800/40">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary-400 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-ping" /> Department Selection
                </div>
                <h3 className="text-xl font-bold text-white">Choose Department</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Select Pakistan Army, Navy, Air Force, Police, or Intelligence setups to align guidelines.</p>
              </div>
              <div className="space-y-3 border-t md:border-t-0 md:border-x border-gray-850 px-0 md:px-6 py-4 md:py-0">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" /> AI Interactive Evaluation
                </div>
                <h3 className="text-xl font-bold text-white">Record Audio / Text Answers</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Submit mock answers and get structured evaluations of strengths, weaknesses, and scores.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Overall Readiness Index
                </div>
                <h3 className="text-xl font-bold text-white">Track Overall Readiness</h3>
                <p className="text-gray-500 text-sm leading-relaxed">View weighted indicators evaluating physical logs, medical checklists, and interview mock scores.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* VERBAL/NON-VERBAL INTELLIGENCE PREPARATION BANNER */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-6 rounded-2xl border border-primary-500/20 bg-gradient-to-r from-primary-950/20 to-purple-950/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary-600/10 transition-all" />
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-primary-600/15 border border-primary-500/25 flex items-center justify-center text-primary-400 flex-shrink-0">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Verbal & Non-Verbal Intelligence Test Prep
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold uppercase tracking-wider">
                  Recommended Practice
                </span>
              </h3>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed max-w-2xl">
                Prepare yourself for the academic, verbal, and non-verbal intelligence tests. Click below to access specialized practice tests and guidelines.
              </p>
            </div>
          </div>
          <a
            href="https://smart-prep-ai-jet.vercel.app" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-primary-600 to-purple-650 hover:from-primary-500 hover:to-purple-550 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            Start Intelligence Prep <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 border-t border-gray-900/60">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold text-white">Everything You Need to Succeed</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            A comprehensive simulation pipeline that addresses the physical, medical, and psychological gates of the recruitment boards.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="glass-card p-6 rounded-2xl border border-gray-800/40 space-y-4 hover:border-gray-700/60 transition-all flex flex-col"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{feat.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* SUPPORTED ORGANIZATIONS */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 border-t border-gray-900/60 bg-gradient-to-b from-transparent to-primary-950/5">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold text-white">Supported Organizations & Forces</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Choose your target career path. We align medical checklist criteria and physical templates dynamically.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {orgs.map((org, idx) => (
            <div
              key={idx}
              className="glass-card p-5 rounded-xl border border-gray-800/30 text-center space-y-2 flex flex-col justify-center"
            >
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mx-auto" />
              <h4 className="font-bold text-sm text-white">{org.name}</h4>
              <p className="text-gray-500 text-[10px] uppercase font-semibold tracking-wider">{org.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 border-t border-gray-900/60">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold text-white">Candidate Success Stories</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Read comments from candidates who completed physical training schedules and passed ISSB & Federal board evaluations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-gray-800/40 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic">"{test.quote}"</p>
              </div>
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-800/40">
                <div className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-500 font-bold flex items-center justify-center text-xs uppercase border border-primary-500/20">
                  {test.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{test.author}</h4>
                  <p className="text-gray-500 text-[10px] font-medium">{test.force}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16 mb-20">
        <div className="glass-panel p-10 md:p-14 rounded-3xl text-center space-y-6 relative overflow-hidden border border-gray-800/50">
          <div className="absolute -right-24 -top-24 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl font-extrabold tracking-tight text-white max-w-xl mx-auto">
            Ready to Begin Your Forces Preparation Journey?
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Set your target force position, complete automated evaluations, and monitor readiness today.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 cursor-pointer"
            >
              Start Preparing Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-gray-900/60 bg-dark-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="ForceReady.AI Logo" className="h-16 w-auto" />
          </div>

          <p>© {new Date().getFullYear()} ForceReady AI. All rights reserved. Prepared for Defense & Administrative Services.</p>

          <div className="flex gap-4">
            <Link to="/login" className="hover:text-white transition-all">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-all">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
