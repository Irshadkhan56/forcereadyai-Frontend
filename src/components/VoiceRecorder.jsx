import React, { useEffect, useState } from 'react';
import { Mic, MicOff, AlertTriangle, Keyboard } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const VoiceRecorder = ({ value, onChange, disabled }) => {
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
  } = useSpeechRecognition();

  // Keep track of whether we had a mic failure or if user manually wants keyboard
  const [useManualText, setUseManualText] = useState(false);

  // Sync speech recognition transcript back to parent in real-time
  useEffect(() => {
    if (isListening && transcript !== undefined) {
      onChange(transcript);
    }
  }, [transcript, isListening, onChange]);

  if (!isSupported) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Voice interview mode is optimized for Chrome and Edge.</p>
            <p className="text-gray-400 mt-0.5">Your browser doesn't support speech recognition. Please type your answer manually below.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Your Response (Manual Input)
          </label>
          <textarea
            rows={6}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your response to the question..."
            className="w-full glass-input rounded-xl p-4 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-primary-500/50"
            disabled={disabled}
            required
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Microphone error display */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Modern Recording Panel & Visualizer */}
      {!useManualText ? (
        <div className="flex flex-col items-center justify-center py-8 bg-gray-950/45 border border-gray-900 rounded-2xl relative overflow-hidden">
          {/* Pulsing Visualizer Waves */}
          {isListening ? (
            <div className="flex items-end justify-center gap-1.5 h-16 mb-6">
              <div className="w-1.5 bg-primary-500 rounded-full animate-bar-pulse-1" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 bg-purple-500 rounded-full animate-bar-pulse-2" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-1.5 bg-primary-400 rounded-full animate-bar-pulse-3" style={{ animationDelay: '0s' }}></div>
              <div className="w-1.5 bg-primary-500 rounded-full animate-bar-pulse-4" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-1.5 bg-purple-400 rounded-full animate-bar-pulse-1" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 bg-primary-600 rounded-full animate-bar-pulse-2" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-1.5 bg-primary-400 rounded-full animate-bar-pulse-3" style={{ animationDelay: '0.15s' }}></div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 mb-6">
              <span className="text-xs text-gray-500 font-medium tracking-wide">
                Click microphone to speak your response
              </span>
            </div>
          )}

          {/* Toggle buttons */}
          <div className="flex items-center gap-4 z-10">
            {!isListening ? (
              <button
                type="button"
                onClick={startListening}
                disabled={disabled}
                className="flex items-center justify-center w-16 h-16 bg-primary-600 hover:bg-primary-500 text-white rounded-full transition-all shadow-lg shadow-primary-600/30 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Start Voice Response"
              >
                <Mic className="w-7 h-7" />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopListening}
                disabled={disabled}
                className="flex items-center justify-center w-16 h-16 bg-red-650 hover:bg-red-650 text-white rounded-full transition-all shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 cursor-pointer animate-pulse disabled:opacity-50"
                title="Stop Recording"
              >
                <MicOff className="w-7 h-7" />
              </button>
            )}
          </div>

          {isListening && (
            <span className="mt-4 text-xs text-primary-400 font-bold uppercase tracking-wider animate-pulse">
              System is listening...
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-950/45 border border-gray-900 rounded-2xl text-xs text-gray-400">
          <span>Voice controls hidden. Type your answer directly below.</span>
          <button
            type="button"
            onClick={() => setUseManualText(false)}
            className="text-primary-450 font-bold hover:underline"
          >
            Show Microphone Controls
          </button>
        </div>
      )}

      {/* Answer Area */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider">
            {isListening ? 'Live Speech Transcript (Speak Now)' : 'Your Response Transcript'}
          </label>
          {!useManualText && (
            <button
              type="button"
              onClick={() => setUseManualText(true)}
              className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 font-bold uppercase transition-all"
            >
              <Keyboard className="w-3.5 h-3.5" />
              Direct Keyboard Entry
            </button>
          )}
        </div>

        <textarea
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            isListening
              ? "Speech recognition active... start speaking now."
              : "Your voice response transcript will appear here. Feel free to review and manually edit or add details before submitting."
          }
          className="w-full glass-input rounded-xl p-4 text-sm text-white placeholder-gray-700 focus:outline-none transition-all duration-300 focus:border-primary-500/50"
          disabled={disabled || isListening}
          required
        />

        {!isListening && (
          <p className="text-[10px] text-gray-500 leading-normal">
            * Review your transcript carefully. You can make keyboard edits directly in the text area above to correct any speech-to-text mistakes.
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
