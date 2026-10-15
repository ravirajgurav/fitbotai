import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Dumbbell,
  User,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Volume2,
  VolumeX,
  Download,
  Timer,
  Sparkles,
  Eye,
} from 'lucide-react';
import { ChatMessageData } from '../types';
import { WorkoutCard, WorkoutCardProps } from './WorkoutCard';

interface ChatMessageProps {
  message: ChatMessageData;
  isLastAssistant: boolean;
  onRetry?: () => void;
  onSelectSuggestion?: (promptText: string) => void;
  onStartRestTimer?: (seconds: number, label?: string) => void;
  onInspectForm?: (exerciseName: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastAssistant,
  onRetry,
  onSelectSuggestion,
  onStartRestTimer,
  onInspectForm,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Voice synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean up markdown text for natural speech synthesis
    const cleanText = message.content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[-*+]\s+/g, '')
      .replace(/\|[^\n]+\|/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleExportRoutine = () => {
    const textData = `==============================\nFITBOT AI WORKOUT ROUTINE\nDate: ${new Date().toLocaleString()}\n==============================\n\n${message.content}\n\n---\nTrain safely & track progressive overload!`;
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FitBot-Workout-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Detect whether message contains workout content (to show export button & timer)
  const isWorkoutPlan =
    !isUser &&
    (message.content.includes('Sets:') ||
      message.content.includes('Reps:') ||
      message.content.toLowerCase().includes('workout') ||
      message.content.toLowerCase().includes('exercise'));

  // Detect rest intervals (e.g. "Rest: 90s", "Rest: 60-90s", "Rest: 2 minutes")
  const restMatch = message.content.match(/Rest:\s*(\d{2,3})/i);
  const detectedRestSeconds = restMatch ? parseInt(restMatch[1], 10) : null;

  // Custom code block renderer to see if a workout block was output
  const renderWorkoutBlock = (codeString: string) => {
    try {
      const parsed = JSON.parse(codeString) as WorkoutCardProps;
      if (parsed && Array.isArray(parsed.exercises)) {
        return <WorkoutCard {...parsed} />;
      }
    } catch {
      // Not a JSON workout block
    }
    return null;
  };

  // Dynamic context-aware suggestions for latest assistant message
  const defaultSuggestions = [
    '🔄 Swap an exercise with Dumbbells',
    '⏱️ How much rest between sets?',
    '🥗 What should I eat post-workout?',
    '🔥 Make this workout beginner friendly',
  ];

  return (
    <div className="flex flex-col w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`group flex w-full gap-3 py-2 px-1 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* AI Avatar */}
        {!isUser && (
          <div className="flex-shrink-0 self-start mt-1">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm ${
                message.isError
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-dark-800 border-neon-500/30 text-neon-400 shadow-neon-sm'
              }`}
            >
              {message.isError ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Dumbbell className="w-4 h-4 -rotate-45" />
              )}
            </div>
          </div>
        )}

        {/* Bubble container */}
        <div
          className={`relative max-w-[90%] sm:max-w-[82%] rounded-2xl p-4 transition-all duration-200 ${
            isUser
              ? 'bg-gradient-to-br from-dark-750 to-dark-800 text-white border border-white/10 shadow-md ml-auto rounded-tr-sm'
              : message.isError
              ? 'bg-red-950/20 border border-red-500/30 text-red-200 rounded-tl-sm'
              : 'bg-dark-850/90 text-gray-100 border border-white/5 shadow-glass rounded-tl-sm'
          }`}
        >
          {/* Header inside bubble */}
          <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px] text-gray-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              {isUser ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-gray-400" />
                </>
              ) : (
                <>
                  <span className={message.isError ? 'text-red-400' : 'text-neon-400 font-bold'}>
                    FitBot AI
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">Coach</span>
                </>
              )}
            </span>

            <span className="text-gray-400 text-[10px] font-mono">
              {formatTime(message.timestamp)}
            </span>
          </div>

          {/* Content body */}
          <div className="text-sm leading-relaxed break-words">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose-gym">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isWorkout = match && match[1] === 'workout';
                      const codeContent = String(children).replace(/\n$/, '');

                      if (isWorkout) {
                        const workoutElement = renderWorkoutBlock(codeContent);
                        if (workoutElement) return workoutElement;
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action buttons footer for AI responses */}
          {!isUser && !message.isError && (
            <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-dark-750 transition-colors"
                  title="Copy workout response"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-neon-400" />
                      <span className="text-neon-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Audio Read Aloud Coach */}
                <button
                  onClick={handleSpeak}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-colors ${
                    isPlayingAudio
                      ? 'bg-neon-500/20 text-neon-400 border border-neon-500/40'
                      : 'text-gray-400 hover:text-white hover:bg-dark-750'
                  }`}
                  title={isPlayingAudio ? "Stop reading" : "Read aloud (Audio Coach)"}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3 h-3 text-neon-400 animate-pulse" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </>
                  )}
                </button>

                {/* Export Routine (.txt) */}
                {isWorkoutPlan && (
                  <button
                    onClick={handleExportRoutine}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-gray-400 hover:text-neon-400 hover:bg-dark-750 transition-colors"
                    title="Export workout routine as text file"
                  >
                    <Download className="w-3 h-3" />
                    <span className="hidden xs:inline">Export Log</span>
                  </button>
                )}

                {/* Form & Biomechanics Inspector */}
                {isWorkoutPlan && onInspectForm && (
                  <button
                    onClick={() => onInspectForm(message.content)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-gray-400 hover:text-cyan-400 hover:bg-dark-750 transition-colors"
                    title="Inspect muscle anatomy & biomechanical form checklist"
                  >
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span className="hidden xs:inline">Form & Muscles</span>
                  </button>
                )}

                {/* Rest Timer Quick Trigger */}
                {detectedRestSeconds && onStartRestTimer && (
                  <button
                    onClick={() => onStartRestTimer(detectedRestSeconds, `${detectedRestSeconds}s Rest`)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-neon-500/10 text-neon-400 hover:bg-neon-500/20 border border-neon-500/30 transition-colors font-medium"
                    title={`Start ${detectedRestSeconds}s Rest Timer`}
                  >
                    <Timer className="w-3 h-3" />
                    <span>Start {detectedRestSeconds}s Rest</span>
                  </button>
                )}
              </div>

              {/* Retry button */}
              {(isLastAssistant || message.isError) && onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-gray-400 hover:text-neon-400 hover:bg-dark-750 transition-colors"
                  title="Regenerate this response"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}

          {message.isError && (
            <div className="mt-2 flex items-center justify-between text-xs text-red-400">
              <span>Request failed</span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-red-300 hover:bg-red-950/40"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="flex-shrink-0 self-start mt-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-dark-750 border border-white/10 text-gray-300">
              <User className="w-4 h-4" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Suggestion Chips under the last assistant message */}
      {!isUser && isLastAssistant && !message.isError && onSelectSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-wrap items-center gap-2 pl-12 pr-4 pt-1 pb-2"
        >
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-neon-400" /> Next:
          </span>
          {defaultSuggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => onSelectSuggestion(sug)}
              className="text-xs px-2.5 py-1 rounded-full bg-dark-850 hover:bg-dark-750 text-gray-300 hover:text-neon-400 border border-white/5 hover:border-neon-500/40 transition-all duration-200 shadow-sm"
            >
              {sug}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};
