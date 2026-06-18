import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelection } from '../context/SelectionContext';
import api from '../services/api';
import {
  FaComments,
  FaHistory,
  FaRegClock,
  FaCheckCircle,
  FaQuestionCircle,
  FaArrowRight,
  FaSpinner,
  FaTrashAlt,
  FaLock,
  FaMicrophone,
  FaKeyboard,
} from 'react-icons/fa';

const MockInterviews = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { selectedDepartment, selectedSubCategory, selectedPosition, clearSelection } = useSelection();

  // Session state: 'idle', 'loading', 'active', 'evaluation', 'finished'
  const [sessionState, setSessionState] = useState('idle');
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // Fetch Interview History
  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['interviewHistory'],
    queryFn: async () => {
      const res = await api.get('/interviews/history');
      return res.data.data;
    },
    enabled: sessionState === 'idle',
  });

  // Start Session Mutation
  const startSessionMutation = useMutation({
    mutationFn: async ({ isVoice = false }) => {
      const res = await api.post('/interviews/sessions', {
        departmentId: selectedDepartment._id,
        subCategory: selectedSubCategory,
        position: selectedPosition,
        count: 20,
        isVoice,
      });
      return res.data.data;
    },
    onSuccess: (data, variables) => {
      if (variables?.isVoice) {
        navigate(`/interviews/voice/${data._id}`);
      } else {
        setCurrentSession(data);
        setCurrentQuestionIdx(0);
        setAnswerText('');
        setFeedback(null);
        setSessionState('active');
        startTimer();
      }
    },
    onError: (err) => {
      console.error('Failed to start session:', err);
      const msg = err.response?.data?.message || '';
      if (msg.includes('not found') || err.response?.status === 404) {
        alert(`${msg || 'Selected configuration not found'}. Please re-select your target department.`);
        clearSelection();
      } else {
        alert(msg || 'Failed to start interview session. Rate limits may apply.');
      }
      setSessionState('idle');
    },
  });

  // Submit Answer Mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ answer }) => {
      const res = await api.post(`/interviews/sessions/${currentSession._id}/answer`, {
        questionIndex: currentQuestionIdx,
        answer,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setFeedback(data.evaluation);
      setSessionState('evaluation');
      if (data.sessionStatus === 'completed') {
        stopTimer();
      }
    },
    onError: (err) => {
      console.error('Failed to evaluate answer:', err);
      alert(err.response?.data?.message || 'Evaluation failed. Please try again.');
    },
  });

  // Delete Session Mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/interviews/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['interviewHistory']);
    },
  });

  // Timer Controllers
  const startTimer = () => {
    setSecondsElapsed(0);
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  useEffect(() => {
    return () => stopTimer();
  }, [timerInterval]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartInterview = (isVoice = false) => {
    setSessionState('loading');
    startSessionMutation.mutate({ isVoice });
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    submitAnswerMutation.mutate({ answer: answerText });
  };

  const handleNextQuestion = () => {
    const nextIdx = currentQuestionIdx + 1;
    if (nextIdx < currentSession.questions.length) {
      setCurrentQuestionIdx(nextIdx);
      setAnswerText('');
      setFeedback(null);
      setSessionState('active');
      startTimer();
    } else {
      setSessionState('finished');
      queryClient.invalidateQueries(['interviewHistory']);
    }
  };

  const handleDeleteSession = (id) => {
    if (confirm('Are you sure you want to delete this session record?')) {
      deleteSessionMutation.mutate(id);
    }
  };

  // Guard: If no target department is chosen
  if (!selectedDepartment) {
    return (
      <div className="glass-panel p-10 rounded-2xl text-center space-y-5 max-w-lg mx-auto">
        <FaLock className="w-12 h-12 text-primary-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Target Department Required</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          You must select your active target department before simulating mock board interviews.
        </p>
        <div className="pt-2">
          <Link
            to="/departments"
            className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-sm transition-all shadow-md"
          >
            Select Department <FaArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (sessionState === 'loading') {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center space-y-6 max-w-xl mx-auto py-20">
        <FaSpinner className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Loading Interview Questions</h2>
          <p className="text-gray-300 text-sm max-w-sm mx-auto leading-relaxed">
            Fetching exam prep questions from the database for <span className="text-white font-semibold">{selectedPosition || selectedDepartment.name}</span>.
          </p>
        </div>
      </div>
    );
  }

  if (sessionState === 'active' || sessionState === 'evaluation') {
    const currentQuestion = currentSession.questions[currentQuestionIdx];
    const isSubmitting = submitAnswerMutation.isPending;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                <span className="px-2 py-0.5 bg-primary-600/20 text-primary-400 rounded-md">
                  Q {currentQuestionIdx + 1} of {currentSession.questions.length}
                </span>
                <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded-md">
                  {currentQuestion.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-400 font-mono">
                <FaRegClock className="w-4 h-4" /> {formatTime(secondsElapsed)}
              </div>
            </div>

            <div className="py-2">
              <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider block mb-2">Simulation Question</span>
              <p className="text-xl font-bold text-white leading-relaxed">{currentQuestion.question}</p>
            </div>

            {sessionState === 'active' ? (
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold uppercase tracking-wider mb-2">
                    Your Response
                  </label>
                  <textarea
                    rows={6}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Provide a clear, detailed response to the question..."
                    className="w-full glass-input rounded-xl p-4 text-sm text-white placeholder-gray-700 focus:outline-none"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !answerText.trim()}
                    className="px-6 py-3.5 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" /> Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Response <FaArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 bg-gray-950/40 p-5 border border-gray-850 rounded-xl">
                <span className="text-sm text-gray-400 font-semibold uppercase tracking-wider block">Your Submitted Response</span>
                <p className="text-sm text-gray-300 italic">"{answerText}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {sessionState === 'evaluation' && feedback && (
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="font-bold text-white text-base">Gemini AI Feedback</h3>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-black text-primary-400">{feedback.score}</span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Strengths</span>
                <p className="text-sm text-gray-300 leading-relaxed">{feedback.strengths}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Weaknesses</span>
                <p className="text-sm text-gray-300 leading-relaxed">{feedback.weaknesses}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Suggestions</span>
                <p className="text-sm text-gray-300 leading-relaxed">{feedback.suggestions}</p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {currentQuestionIdx === currentSession.questions.length - 1 ? (
                  <>
                    Finish Interview <FaCheckCircle className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next Question <FaArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (sessionState === 'finished') {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
          <FaCheckCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Interview Simulation Complete</h2>
          <p className="text-gray-300 text-sm max-w-sm mx-auto leading-relaxed">
            All questions have been evaluated. Your average mock score has been updated in the database and overall readiness recalculated.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setSessionState('idle')}
            className="flex-1 border border-gray-800 hover:border-gray-700 bg-gray-900/40 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
          >
            View History
          </button>
          <Link
            to={`/department/${selectedDepartment.slug}`}
            className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            Go to Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/15 border border-purple-500/20 rounded-full text-xs font-semibold text-purple-400">
            <FaComments className="w-4 h-4" /> Real-time Simulation
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Active Target: <span className="text-primary-500">{selectedPosition || selectedDepartment.name}</span>
          </h1>
          <p className="text-gray-300 text-base max-w-xl">
            Simulate a realistic 20-question interview board. Get scored instantly out of 100 on content, terminology, and logical reasoning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleStartInterview(false)}
            className="flex items-center gap-1.5 px-5 py-3.5 border border-gray-800 hover:border-gray-750 bg-gray-900/40 text-white text-sm font-bold rounded-xl transition-all hover:bg-gray-900 cursor-pointer"
          >
            <FaKeyboard className="w-4 h-4 text-gray-400" /> Standard Written Board
          </button>
          
          <button
            onClick={() => handleStartInterview(true)}
            className="flex items-center gap-1.5 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/20 cursor-pointer"
          >
            <FaMicrophone className="w-4 h-4" /> Start Voice Board Mode
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaHistory className="w-5 h-5 text-primary-400" /> Historical Session Logs
          </h2>
          <p className="text-gray-300 text-sm mt-1">Review scores and comments of your past interview attempts</p>
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : !historyData || historyData.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-gray-850 text-center space-y-3">
            <FaQuestionCircle className="w-12 h-12 text-gray-750 mx-auto" />
            <h4 className="font-bold text-white">No Sessions Found</h4>
            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
              You haven't completed any mock interview simulation sessions yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {historyData.map((sess) => (
              <div key={sess._id} className="glass-panel p-6 rounded-2xl border border-gray-850/80 flex flex-col justify-between gap-5 relative group">
                <button
                  onClick={() => handleDeleteSession(sess._id)}
                  className="absolute top-5 right-5 p-2 border border-red-500/10 hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete Session"
                >
                  <FaTrashAlt className="w-4 h-4" />
                </button>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 text-gray-300 rounded-md font-medium">
                      {sess.departmentId?.name}
                    </span>
                    {sess.position && (
                      <span className="px-2 py-0.5 bg-primary-600/15 text-primary-400 rounded-md font-medium">
                        {sess.position}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white">{sess.questions.length} Simulation Questions</h3>
                  <p className="text-xs text-gray-400 font-mono">Attempted: {new Date(sess.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-850/80 pt-4">
                  <span className="text-gray-400 text-sm font-semibold">Average Mock Score</span>
                  <div className="flex items-center gap-1 bg-primary-600/10 border border-primary-500/20 px-3 py-1 rounded-lg">
                    <span className="text-base font-black text-primary-400">{sess.totalScore}</span>
                    <span className="text-xs text-gray-400">/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviews;
