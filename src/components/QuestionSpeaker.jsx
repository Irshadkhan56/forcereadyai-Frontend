import React, { useEffect } from 'react';
import { Volume2, Play, Pause, Square } from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const QuestionSpeaker = ({ text, autoPlay = true }) => {
  const {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
  } = useSpeechSynthesis();

  useEffect(() => {
    if (autoPlay && text) {
      // Small timeout to give SpeechSynthesis time to load voices
      const timer = setTimeout(() => {
        speak(text);
      }, 500);
      return () => {
        clearTimeout(timer);
        stop();
      };
    }
    return () => stop();
  }, [text, autoPlay]);

  if (!isSupported) {
    return (
      <div className="text-xs text-amber-500 font-semibold bg-amber-500/10 px-3 py-2 border border-amber-500/20 rounded-xl">
        Text-to-Speech is not supported in this browser.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={() => speak(text)}
        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600/20 border border-primary-500/30 hover:bg-primary-600/35 text-primary-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
        title="Replay Question"
      >
        <Volume2 className="w-4 h-4" />
        Replay Question
      </button>

      {isSpeaking && (
        <>
          {isPaused ? (
            <button
              onClick={resume}
              className="flex items-center justify-center p-2 bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/35 text-amber-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Resume Reading"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex items-center justify-center p-2 bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/35 text-amber-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Pause Reading"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={stop}
            className="flex items-center justify-center p-2 bg-red-600/20 border border-red-500/30 hover:bg-red-600/35 text-red-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Stop Reading"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </>
      )}
    </div>
  );
};

export default QuestionSpeaker;
