import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Mic, MicOff, Timer, Sparkles, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  onOpenTimer?: () => void;
}

// Type declaration for browser Web Speech Recognition
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
  onOpenTimer,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);

  // Quick Prompt Builder state
  const [builderMuscle, setBuilderMuscle] = useState('Chest');
  const [builderEquip, setBuilderEquip] = useState('Dumbbells');
  const [builderTime, setBuilderTime] = useState('30m');
  const [builderGoal, setBuilderGoal] = useState('Hypertrophy');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    const SpeechRecognitionClass = 
      ((window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition) ||
      ((window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition);

    if (!SpeechRecognitionClass) {
      alert("Voice input is not supported in this browser. Try Google Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onSendMessage(trimmed);
    setInput('');
    setShowPromptBuilder(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleApplyBuilderPrompt = (sendNow = false) => {
    const prompt = `Give me a ${builderTime} ${builderMuscle} workout using ${builderEquip} focused on ${builderGoal}. Include exercises, sets, reps, rest intervals, and coaching form cues.`;
    if (sendNow) {
      onSendMessage(prompt);
      setShowPromptBuilder(false);
    } else {
      setInput(prompt);
      setShowPromptBuilder(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSendDisabled = !input.trim() || isLoading || disabled;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      {/* Quick Prompt Builder Drawer */}
      {showPromptBuilder && (
        <div className="mb-2 p-3.5 rounded-2xl glass-panel border border-neon-500/30 bg-dark-900/95 shadow-glass animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
            <span className="text-xs font-bold uppercase tracking-wider text-neon-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prompt Builder (NLP Slot Filler)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowPromptBuilder(false)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {/* Muscle Group */}
            <div className="flex items-center gap-2">
              <span className="w-16 font-semibold text-gray-400 text-[11px]">Muscle:</span>
              <div className="flex flex-wrap gap-1">
                {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Full Body'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setBuilderMuscle(m)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                      builderMuscle === m
                        ? 'bg-neon-500 text-dark-950 font-bold'
                        : 'bg-dark-800 text-gray-300 hover:bg-dark-750'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="flex items-center gap-2">
              <span className="w-16 font-semibold text-gray-400 text-[11px]">Equip:</span>
              <div className="flex flex-wrap gap-1">
                {['Dumbbells', 'Barbell', 'Bodyweight', 'Cables', 'Full Gym'].map((eq) => (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => setBuilderEquip(eq)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                      builderEquip === eq
                        ? 'bg-neon-500 text-dark-950 font-bold'
                        : 'bg-dark-800 text-gray-300 hover:bg-dark-750'
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Goal */}
            <div className="flex items-center gap-2">
              <span className="w-16 font-semibold text-gray-400 text-[11px]">Time / Goal:</span>
              <div className="flex flex-wrap gap-1">
                {['15m', '30m', '45m', '60m'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBuilderTime(t)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                      builderTime === t
                        ? 'bg-neon-500 text-dark-950 font-bold'
                        : 'bg-dark-800 text-gray-300 hover:bg-dark-750'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                <span className="text-gray-500 mx-1">|</span>
                {['Hypertrophy', 'Fat Loss', 'Strength'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setBuilderGoal(g)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                      builderGoal === g
                        ? 'bg-neon-500 text-dark-950 font-bold'
                        : 'bg-dark-800 text-gray-300 hover:bg-dark-750'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => handleApplyBuilderPrompt(false)}
                className="px-2.5 py-1 rounded-lg text-[11px] text-gray-300 hover:text-white bg-dark-800 hover:bg-dark-750 border border-white/5"
              >
                Insert in Input
              </button>
              <button
                type="button"
                onClick={() => handleApplyBuilderPrompt(true)}
                className="px-3 py-1 rounded-lg text-[11px] font-bold bg-neon-500 hover:bg-neon-400 text-dark-950 shadow-neon-sm"
              >
                ⚡ Generate Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-end gap-2 bg-dark-850/95 border rounded-2xl p-2.5 shadow-glass transition-all duration-200 ${
          isListening
            ? 'border-neon-400 shadow-[0_0_24px_rgba(200,245,60,0.35)] ring-1 ring-neon-400'
            : 'border-white/10 focus-within:border-neon-500/50 focus-within:shadow-neon-sm'
        }`}
      >
        {/* Quick prompt builder toggle */}
        <button
          type="button"
          onClick={() => setShowPromptBuilder((prev) => !prev)}
          className={`flex-shrink-0 p-2 rounded-xl transition-colors ${
            showPromptBuilder
              ? 'bg-neon-500 text-dark-950 font-bold'
              : 'text-gray-400 hover:text-neon-400 hover:bg-dark-750'
          }`}
          title="Toggle Quick Prompt Builder"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Quick timer opener */}
        {onOpenTimer && (
          <button
            type="button"
            onClick={onOpenTimer}
            className="flex-shrink-0 p-2 rounded-xl text-gray-400 hover:text-neon-400 hover:bg-dark-750 transition-colors"
            title="Open Gym Rest Timer"
            aria-label="Open Gym Rest Timer"
          >
            <Timer className="w-4 h-4" />
          </button>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? "Listening to your workout instructions... (speak now)"
              : "Ask anything about workouts, exercises, or fitness..."
          }
          rows={1}
          disabled={disabled || isLoading}
          className="w-full resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none max-h-40 leading-relaxed font-sans scrollbar-none disabled:opacity-50"
          aria-label="Chat input message"
        />

        {/* Voice Input Microphone Button */}
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`flex-shrink-0 p-2 rounded-xl transition-all ${
            isListening
              ? 'bg-neon-500 text-dark-950 animate-pulse shadow-neon-sm font-bold'
              : 'text-gray-400 hover:text-white hover:bg-dark-750'
          }`}
          title={isListening ? "Stop listening" : "Voice input (Hands-free gym dictation)"}
          aria-label={isListening ? "Stop listening" : "Voice input"}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={isSendDisabled}
          aria-label="Send message"
          className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
            isSendDisabled
              ? 'bg-dark-750 text-gray-500 cursor-not-allowed border border-white/5 opacity-60'
              : 'bg-neon-500 hover:bg-neon-400 text-dark-950 font-bold shadow-neon-sm hover:scale-105 active:scale-95'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
          ) : (
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>
      </form>

      {/* Subtle footer */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 font-medium tracking-wide px-1">
        <span>AI-powered fitness guidance · Train safely, progress consistently</span>
        <span className="hidden sm:inline text-gray-500">
          💡 Click ✨ for Prompt Builder
        </span>
      </div>
    </div>
  );
};
