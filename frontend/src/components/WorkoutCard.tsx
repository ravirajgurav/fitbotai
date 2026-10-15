import React, { useState } from 'react';
import { Dumbbell, Clock, Repeat, Flame, ShieldAlert, Award, CheckCircle2, Circle } from 'lucide-react';

export interface ExerciseItem {
  name: string;
  target?: string;
  sets?: string;
  reps?: string;
  rest?: string;
  notes?: string;
  tempo?: string;
}

export interface WorkoutCardProps {
  title?: string;
  focus?: string;
  duration?: string;
  difficulty?: string;
  exercises: ExerciseItem[];
  tips?: string[];
  onStartRestTimer?: (seconds: number, label?: string) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  title = "Targeted Workout Routine",
  focus,
  duration,
  difficulty,
  exercises,
  tips,
  onStartRestTimer,
}) => {
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  const toggleComplete = (idx: number) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const completedCount = Object.values(completedExercises).filter(Boolean).length;
  const totalCount = exercises.length;

  const parseRestSeconds = (restStr?: string): number => {
    if (!restStr) return 90;
    const match = restStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 90;
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-neon-500/30 bg-gradient-to-b from-dark-850 to-dark-900 shadow-glass">
      {/* Card Header */}
      <div className="bg-dark-800/90 px-4 py-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-neon-500/10 text-neon-400 border border-neon-500/20">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">{title}</h4>
            {focus && <span className="text-xs text-neon-400/90 font-medium">{focus}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-dark-750 text-neon-400 border border-neon-500/20">
              {completedCount}/{totalCount} Done
            </span>
          )}
          {difficulty && (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-dark-750 text-gray-300 border border-white/5 flex items-center gap-1">
              <Award className="w-3 h-3 text-neon-400" />
              {difficulty}
            </span>
          )}
          {duration && (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-dark-750 text-gray-300 border border-white/5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-neon-400" />
              {duration}
            </span>
          )}
        </div>
      </div>

      {/* Exercise List */}
      <div className="divide-y divide-white/5">
        {exercises.map((exercise, idx) => {
          const isDone = !!completedExercises[idx];
          const restSeconds = parseRestSeconds(exercise.rest);

          return (
            <div
              key={idx}
              className={`p-3.5 transition-colors ${
                isDone ? 'bg-neon-500/[0.03] opacity-75' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleComplete(idx)}
                    className="flex-shrink-0 text-gray-500 hover:text-neon-400 transition-colors"
                    title={isDone ? "Mark as uncompleted" : "Mark as completed"}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-neon-400 fill-neon-400/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  <span
                    className={`text-sm font-semibold tracking-tight transition-all ${
                      isDone ? 'text-gray-400 line-through' : 'text-white'
                    }`}
                  >
                    {exercise.name}
                  </span>
                </div>

                {exercise.target && (
                  <span className="text-[11px] font-medium text-gray-400 bg-dark-750 px-2 py-0.5 rounded-full border border-white/5 whitespace-nowrap">
                    {exercise.target}
                  </span>
                )}
              </div>

              {/* Metrics Chips */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-1 text-xs">
                <div className="bg-dark-800/80 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-semibold text-gray-400 flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5 text-neon-400" /> Sets
                  </span>
                  <span className="font-mono font-bold text-white text-xs mt-0.5">
                    {exercise.sets || '3 - 4'}
                  </span>
                </div>

                <div className="bg-dark-800/80 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-semibold text-gray-400 flex items-center gap-1">
                    <Repeat className="w-2.5 h-2.5 text-neon-400" /> Reps
                  </span>
                  <span className="font-mono font-bold text-white text-xs mt-0.5">
                    {exercise.reps || '8 - 12'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onStartRestTimer?.(restSeconds, `${exercise.name} Rest`)}
                  className="bg-dark-800/80 hover:bg-dark-750 rounded-lg p-2 border border-white/5 hover:border-neon-500/30 flex flex-col items-center justify-center transition-colors group"
                  title="Click to start rest timer"
                >
                  <span className="text-[10px] uppercase font-semibold text-gray-400 flex items-center gap-1 group-hover:text-neon-400">
                    <Clock className="w-2.5 h-2.5 text-neon-400" /> Rest
                  </span>
                  <span className="font-mono font-bold text-neon-400 text-xs mt-0.5 underline decoration-dotted">
                    {exercise.rest || '60 - 90s'}
                  </span>
                </button>
              </div>

              {exercise.notes && (
                <p className="mt-2 text-xs text-gray-300 italic pl-2 border-l-2 border-neon-500/40">
                  <span className="font-semibold text-gray-200 not-italic">Coach Cue:</span> {exercise.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Trainer Tips Footer */}
      {tips && tips.length > 0 && (
        <div className="bg-dark-850 px-4 py-2.5 border-t border-white/5 text-xs text-gray-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-neon-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            {tips.map((tip, i) => (
              <div key={i} className="text-gray-300 font-medium">
                • {tip}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
