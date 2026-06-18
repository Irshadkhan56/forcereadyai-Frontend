import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import QuestionSpeaker from '../components/QuestionSpeaker';
import VoiceRecorder from '../components/VoiceRecorder';
import {
  Shield,
  Timer,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  X,
  Loader2,
  HelpCircle
} from 'lucide-react';

const VoiceInterview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [sessionState, setSessionState] = useState('active'); // 'active', 'evaluation', 'finished'
  const [feedback, setFeedback] = useState(null);

  // Timer states
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // Keyboard accessibility triggers
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        const replayBtn = document.querySelector('[title="Replay Question"]');
        if (replayBtn) replayBtn.click();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Fetch Session Details
  const { data: sessionData, isLoading, error } = useQuery({
    queryKey: ['interviewSession', sessionId],
    queryFn: async () => {
      const res = await api.get(`/interviews/sessions/${sessionId}`);
      return res.data.data;
    },
    retry: 1
  });

  // Submit Answer Mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ answer }) => {
      const res = await api.post(`/interviews/sessions/${sessionId}/answer`, {
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
      console.error('Failed to submit answer:', err);
      alert(err.response?.data?.message || 'Failed to submit response. Please try again.');
    },
  });

  // Timer Controls
  const startTimer = () => {
    if (timerInterval) return;
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
    if (sessionData && sessionState === 'active') {
      startTimer();
    }
    return () => stopTimer();
  }, [sessionData, sessionState]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!answerText.trim()) return;
    submitAnswerMutation.mutate({ answer: answerText });
  };

  const handleNextQuestion = () => {
    const nextIdx = currentQuestionIdx + 1;
    if (nextIdx < sessionData.questions.length) {
      setCurrentQuestionIdx(nextIdx);
      setAnswerText('');
      setFeedback(null);
      setSessionState('active');
    } else {
      setSessionState('finished');
      queryClient.invalidateQueries(['interviewHistory']);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        <h2 className="text-lg font-bold text-white tracking-wide">Initializing Voice Simulation Room...</h2>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-6 space-y-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-white">Failed to Load Interview Room</h2>
          <p className="text-gray-400 text-sm">
            {error?.response?.data?.message || 'The interview session details could not be retrieved.'}
          </p>
        </div>
        <Link to="/dashboard" className="px-5 py-2.5 bg-gray-900 border border-gray-800 text-white rounded-xl text-xs font-bold hover:bg-gray-850">
          Go Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentQuestion = sessionData.questions[currentQuestionIdx];
  const totalQuestions = sessionData.questions.length;
  const progressPercent = Math.round(((currentQuestionIdx) / totalQuestions) * 100);

  if (sessionState === 'finished') {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-2xl text-center space-y-6 max-w-md w-full border border-gray-850">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Voice Simulation Complete</h2>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
              Your voice interview results have been processed and stored. Your overall scores have been successfully updated.
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => navigate(`/department/${sessionData.departmentId?.slug}/interview`)}
              className="flex-1 border border-gray-800 hover:border-gray-750 bg-gray-900/40 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
            >
              Exit Interview
            </button>
            <Link
              to={`/department/${sessionData.departmentId?.slug}`}
              className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              Readiness Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col relative overflow-hidden">
      {/* Top Header Navigation */}
      <header className="border-b border-gray-900/60 bg-[#07090e]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600/15 border border-primary-500/25 rounded-lg flex items-center justify-center text-primary-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">ForceReady Mock Board</h1>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
              {sessionData.departmentId?.name || 'Active Service'} {sessionData.position ? `• ${sessionData.position}` : ''}
            </p>
          </div>
        </div>

        {/* Real-time Indicators */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-950/60 border border-gray-850 px-3 py-1.5 rounded-lg">
            <Timer className="w-4 h-4 text-primary-400" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to exit the interview room? Progress for unanswered questions will not be saved.')) {
                navigate(`/department/${sessionData.departmentId?.slug}/interview`);
              }
            }}
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-900 rounded-lg transition-all cursor-pointer"
            title="Exit Room"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Track */}
      <div className="w-full h-1 bg-gray-950">
        <div
          className="h-full bg-gradient-to-r from-primary-600 to-purple-600 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Left Side: Simulation Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-gray-850 space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-primary-600/10 text-primary-400 border border-primary-500/10 text-xs font-bold rounded-md uppercase tracking-wider">
                Question {currentQuestionIdx + 1} of {totalQuestions}
              </span>
              <span className="px-2.5 py-0.5 bg-purple-600/15 border border-purple-500/15 text-purple-400 text-xs font-semibold rounded-md">
                {currentQuestion.category || 'General'}
              </span>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Question Prompt</span>
              <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            <div className="border-t border-b border-gray-900/60 py-3.5 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-semibold tracking-wide">Audio Prompter:</span>
              <QuestionSpeaker text={currentQuestion.question} autoPlay={true} />
            </div>

            {sessionState === 'active' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <VoiceRecorder
                  value={answerText}
                  onChange={setAnswerText}
                  disabled={submitAnswerMutation.isPending}
                />

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitAnswerMutation.isPending || !answerText.trim()}
                    className="px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitAnswerMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Answer...
                      </>
                    ) : (
                      <>
                        Submit Response <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 bg-gray-950/50 p-5 border border-gray-900 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Submitted Transcript</span>
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  "{answerText}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Evaluation Feedback Board */}
        <div className="lg:col-span-4 space-y-6 h-full">
          {sessionState === 'evaluation' && feedback ? (
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6 animate-fadeIn relative">
              <div className="flex items-center justify-between border-b border-gray-900/60 pb-4">
                <div>
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Board Assessment</h3>
                  <p className="text-[10px] text-gray-500">Instant AI response evaluation</p>
                </div>
                <div className="flex items-baseline gap-0.5 bg-primary-600/10 border border-primary-500/20 px-3 py-1 rounded-lg">
                  <span className="text-lg font-black text-primary-400">{feedback.matchPercentage || Math.round(feedback.score * 10)}</span>
                  <span className="text-[10px] text-gray-500">/100</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Key Strengths
                </div>
                <p className="text-xs text-gray-300 leading-relaxed bg-emerald-500/[0.02] border border-emerald-500/5 p-3 rounded-lg">
                  {feedback.strengths}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Weaknesses / Gaps
                </div>
                <p className="text-xs text-gray-300 leading-relaxed bg-red-500/[0.02] border border-red-500/5 p-3 rounded-lg">
                  {feedback.weaknesses}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Suggestions for Improvement
                </div>
                <p className="text-xs text-gray-300 leading-relaxed bg-amber-500/[0.02] border border-amber-500/5 p-3 rounded-lg">
                  {feedback.suggestions}
                </p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                {currentQuestionIdx === totalQuestions - 1 ? (
                  <>
                    Complete Interview <CheckCircle className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next Board Question <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl border border-gray-850 text-center py-10 space-y-4">
              <HelpCircle className="w-10 h-10 text-gray-700 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs uppercase tracking-wide">Pending Response</h4>
                <p className="text-gray-500 text-[11px] max-w-[200px] mx-auto leading-normal">
                  Submit your response transcript to receive instant board analysis and feedback.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VoiceInterview;
