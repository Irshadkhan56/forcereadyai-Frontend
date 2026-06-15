import { useState, useEffect, useRef } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      setError('');
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (e) => {
      console.error('Speech recognition error:', e);
      // Suppress service errors if they are not critical
      if (e.error === 'no-speech') {
        setError('No speech was detected. Please try speaking again.');
      } else {
        setError(`Microphone error: ${e.error}`);
      }
      setIsListening(false);
    };

    rec.onresult = (event) => {
      let fullResult = '';
      for (let i = 0; i < event.results.length; i++) {
        fullResult += event.results[i][0].transcript;
      }
      setTranscript(fullResult);
    };

    recognitionRef.current = rec;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setError('');
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error(err);
      setError('Microphone is already active or failed to start.');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error(err);
    }
  };

  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
    setTranscript
  };
};
