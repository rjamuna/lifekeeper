import { useState, useRef, useCallback, useEffect } from "react";

// Browser compatibility check — done once at module load
const getSpeechRecognition = () =>
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export const isSpeechSupported = () => !!getSpeechRecognition();

const STATES = {
  IDLE: "idle",
  LISTENING: "listening",
  PROCESSING: "processing",
  ERROR: "error",
};

/**
 * useSpeechRecognition
 *
 * @param {object} options
 * @param {string} options.lang  - BCP-47 language tag e.g. "en-US", "ta-IN", "hi-IN"
 * @param {function} options.onTranscript - called with final transcript string
 * @param {function} options.onInterim   - called with interim (in-progress) string
 */
const useSpeechRecognition = ({ lang = "en-US", onTranscript, onInterim } = {}) => {
  const [state, setState] = useState(STATES.IDLE);
  const [error, setError] = useState(null);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef(null);
  const finalRef = useRef("");

  // Tear down on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setError("SpeechRecognition is not supported in this browser.");
      setState(STATES.ERROR);
      return;
    }

    // Abort any existing session
    recognitionRef.current?.abort();
    finalRef.current = "";
    setInterimText("");
    setError(null);

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = false;       // single utterance
    recognition.interimResults = true;    // show live transcript
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState(STATES.LISTENING);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (interim) {
        setInterimText(interim);
        onInterim?.(interim);
      }
      if (final) {
        finalRef.current += final;
        setInterimText("");
      }
    };

    recognition.onspeechend = () => {
      setState(STATES.PROCESSING);
      recognition.stop();
    };

    recognition.onend = () => {
      setState(STATES.IDLE);
      setInterimText("");
      if (finalRef.current.trim()) {
        onTranscript?.(finalRef.current.trim());
        finalRef.current = "";
      }
    };

    recognition.onerror = (event) => {
      setState(STATES.ERROR);
      setInterimText("");
      switch (event.error) {
        case "not-allowed":
        case "permission-denied":
          setError("Microphone permission was denied. Please allow microphone access in your browser settings and try again.");
          break;
        case "no-speech":
          setError("No speech was detected. Please try speaking again.");
          break;
        case "audio-capture":
          setError("No microphone found. Please connect a microphone and try again.");
          break;
        case "network":
          setError("A network error occurred during speech recognition. Please check your connection.");
          break;
        case "aborted":
          // User stopped manually — not an error
          setState(STATES.IDLE);
          setError(null);
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      setError(`Could not start microphone: ${err.message}`);
      setState(STATES.ERROR);
    }
  }, [lang, onTranscript, onInterim]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setState(STATES.IDLE);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setState(STATES.IDLE);
  }, []);

  return {
    state,
    isListening: state === STATES.LISTENING,
    isProcessing: state === STATES.PROCESSING,
    interimText,
    error,
    start,
    stop,
    clearError,
    STATES,
  };
};

export default useSpeechRecognition;
