import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, X, Plus, Minus } from 'lucide-react';
import { RestTimerState } from '../types';

interface RestTimerProps {
  timer: RestTimerState;
  onUpdateTimer: (updater: (prev: RestTimerState) => RestTimerState) => void;
  onClose: () => void;
}

// Synthesize pleasant gym bell chimes using Web Audio API
function playGymBuzzer() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [880, 1174.66, 1760]; // A5, D6, A6 high energy chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.45);
    });
  } catch (err) {
    console.warn("Audio playback not permitted yet", err);
  }
}

export const RestTimer: React.FC<RestTimerProps> = ({ timer, onUpdateTimer, onClose }) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer loop
  useEffect(() => {
    if (timer.isActive && timer.isRunning && timer.secondsRemaining > 0) {
      intervalRef.current = setInterval(() => {
        onUpdateTimer((prev) => {
          if (prev.secondsRemaining <= 1) {
            playGymBuzzer();
            return {
              ...prev,
              secondsRemaining: 0,
              isRunning: false,
            };
          }
          return {
            ...prev,
            secondsRemaining: prev.secondsRemaining - 1,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer.isActive, timer.isRunning, timer.secondsRemaining, onUpdateTimer]);

  if (!timer.isActive) return null;

  const minutes = Math.floor(timer.secondsRemaining / 60);
  const seconds = timer.secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = timer.totalSeconds > 0 
    ? Math.max(0, Math.min(100, (timer.secondsRemaining / timer.totalSeconds) * 100))
    : 0;

  const handleTogglePlay = () => {
    if (timer.secondsRemaining === 0) {
      // Reset if expired
      onUpdateTimer((prev) => ({
        ...prev,
        secondsRemaining: prev.totalSeconds || 90,
        isRunning: true,
      }));
    } else {
      onUpdateTimer((prev) => ({ ...prev, isRunning: !prev.isRunning }));
    }
  };

  const handleReset = () => {
    onUpdateTimer((prev) => ({
      ...prev,
      secondsRemaining: prev.totalSeconds,
      isRunning: false,
    }));
  };

  const handleAdjust = (delta: number) => {
    onUpdateTimer((prev) => {
      const nextSec = Math.max(5, prev.secondsRemaining + delta);
      const nextTotal = Math.max(nextSec, prev.totalSeconds);
      return {
        ...prev,
        secondsRemaining: nextSec,
        totalSeconds: nextTotal,
      };
    });
  };

  const handleSetPreset = (presetSec: number) => {
    onUpdateTimer(() => ({
      isActive: true,
      totalSeconds: presetSec,
      secondsRemaining: presetSec,
      isRunning: true,
      label: `${presetSec}s Rest`,
    }));
  };

  const isFinished = timer.secondsRemaining === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-24 right-4 sm:right-6 z-40 w-72 rounded-2xl p-4 glass-panel border border-neon-500/40 shadow-neon-md bg-dark-900/95 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neon-400">
            <Timer className="w-4 h-4" />
            <span>{timer.label || 'Workout Rest Timer'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
            title="Close Timer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Big Digital Countdown */}
        <div className="flex flex-col items-center justify-center my-2 py-1">
          <span
            className={`font-mono text-4xl sm:text-5xl font-black tracking-tight ${
              isFinished
                ? 'text-red-400 animate-pulse'
                : timer.isRunning
                ? 'text-neon-400 neon-glow-text'
                : 'text-gray-300'
            }`}
          >
            {formattedTime}
          </span>
          <span className="text-[10px] uppercase font-semibold text-gray-400 mt-1">
            {isFinished ? 'Rest Complete! Next Set Ready 💪' : timer.isRunning ? 'Active Rest Interval' : 'Timer Paused'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden my-2.5">
          <div
            className={`h-full transition-all duration-300 ${
              isFinished ? 'bg-red-500' : 'bg-neon-500 shadow-[0_0_10px_#c8f53c]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAdjust(-15)}
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-gray-300 hover:text-white border border-white/5 text-xs transition-colors"
              title="-15 seconds"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleAdjust(15)}
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-gray-300 hover:text-white border border-white/5 text-xs transition-colors"
              title="+15 seconds"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleTogglePlay}
            className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
              timer.isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-dark-950 shadow-amber-500/20'
                : 'bg-neon-500 hover:bg-neon-400 text-dark-950 shadow-neon-sm'
            }`}
          >
            {timer.isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isFinished ? 'Restart' : 'Resume'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-gray-300 hover:text-white border border-white/5 text-xs transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-white/5">
          {[30, 60, 90, 120].map((sec) => (
            <button
              key={sec}
              onClick={() => handleSetPreset(sec)}
              className={`py-1 rounded-lg text-[11px] font-semibold transition-all ${
                timer.totalSeconds === sec && !isFinished
                  ? 'bg-neon-500/20 text-neon-400 border border-neon-500/40'
                  : 'bg-dark-800/80 text-gray-400 hover:text-gray-200 hover:bg-dark-750'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
