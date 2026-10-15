import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, ShieldAlert, CheckCircle, Eye } from 'lucide-react';

export interface FormExerciseData {
  name: string;
  primeMovers: string[];
  synergists: string[];
  stabilizers: string[];
  setupCues: string[];
  mistakesToAvoid: string[];
}

interface FormInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName?: string;
}

// Knowledge base of biomechanical data for common movements
const EXERCISE_KNOWLEDGE_BASE: Record<string, FormExerciseData> = {
  'bench': {
    name: 'Incline / Flat Barbell & Dumbbell Press',
    primeMovers: ['Pectoralis Major (Clavicular & Sternal Heads)'],
    synergists: ['Anterior Deltoids', 'Triceps Brachii (Lateral & Medial Heads)'],
    stabilizers: ['Rotator Cuff (Supraspinatus/Infraspinatus)', 'Serratus Anterior', 'Latissimus Dorsi'],
    setupCues: [
      'Retract and depress shoulder blades into the bench to form a firm foundation.',
      'Maintain a 45° to 60° elbow angle relative to torso (avoid 90° shoulder impingement flare).',
      'Inhale on the 3-second descent; drive feet through the floor and exhale on the press.',
    ],
    mistakesToAvoid: [
      'Bouncing the bar or weights off the sternum.',
      'Flaring elbows out perpendicular to the neck.',
      'Allowing wrists to bend backward under heavy loads.',
    ],
  },
  'pull': {
    name: 'Lat Pulldown / Pull-ups / Barbell Rows',
    primeMovers: ['Latissimus Dorsi', 'Teres Major'],
    synergists: ['Biceps Brachii', 'Brachialis', 'Rhomboids', 'Middle & Lower Trapezius'],
    stabilizers: ['Erector Spinae', 'Posterior Deltoids', 'Forearm Flexors'],
    setupCues: [
      'Initiate the movement by depressing the scapulae (pulling shoulder blades down) before bending elbows.',
      'Drive elbows down towards back pockets rather than yanking with hands.',
      'Squeeze mid-back at full contraction for a 1-second peak isometric hold.',
    ],
    mistakesToAvoid: [
      'Excessive backward torso swinging (using lumbar momentum).',
      'Failing to reach full overhead stretch on the eccentric phase.',
      'Dominating the pull with the forearms and biceps.',
    ],
  },
  'squat': {
    name: 'Barbell Back Squat / Front Squat / Leg Press',
    primeMovers: ['Quadriceps Femoris (Rectus Femoris, Vastus Lateralis/Medialis)'],
    synergists: ['Gluteus Maximus', 'Adductor Magnus', 'Soleus'],
    stabilizers: ['Hamstrings', 'Erector Spinae', 'Transverse Abdominis (Core Brace)'],
    setupCues: [
      'Take a deep diaphragmatic breath into the belly and brace the core 360° (Valsalva maneuver).',
      'Hinge hips and knees simultaneously, tracking knees in line with the toes.',
      'Descend until hip crease is at or slightly below the top of the patella (parallel depth).',
    ],
    mistakesToAvoid: [
      'Knee valgus collapse (knees caving inward on ascent).',
      'Heels lifting off the ground (insufficient ankle dorsiflexion).',
      'Losing thoracic extension ("good-morning" squat).',
    ],
  },
};

export const FormInspectorModal: React.FC<FormInspectorModalProps> = ({
  isOpen,
  onClose,
  exerciseName = 'bench',
}) => {
  if (!isOpen) return null;

  // Find matching exercise data
  const lower = exerciseName.toLowerCase();
  let key = 'bench';
  if (lower.includes('pull') || lower.includes('lat') || lower.includes('row') || lower.includes('bicep')) key = 'pull';
  else if (lower.includes('squat') || lower.includes('leg') || lower.includes('quad') || lower.includes('deadlift')) key = 'squat';

  const data = EXERCISE_KNOWLEDGE_BASE[key];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-lg rounded-2xl glass-panel border border-cyan-500/40 bg-dark-900 shadow-glass overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-dark-850 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Biomechanical Form & Anatomy Inspector
                </h3>
                <p className="text-xs text-cyan-400 font-medium">{data.name}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-750 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-none">
            {/* Muscle Breakdown Bar */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Muscle Activation Breakdown
              </span>

              {/* Prime Mover */}
              <div className="p-2.5 rounded-xl bg-dark-800/80 border border-white/5 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Prime Movers (Agonists)</span>
                  <span className="font-mono text-neon-400 font-bold">100% Load</span>
                </div>
                <div className="w-full bg-dark-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-neon-500 h-full w-full shadow-[0_0_8px_#c8f53c]" />
                </div>
                <p className="text-[11px] text-gray-300">{data.primeMovers.join(', ')}</p>
              </div>

              {/* Synergists */}
              <div className="p-2.5 rounded-xl bg-dark-800/80 border border-white/5 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Synergists (Assisting)</span>
                  <span className="font-mono text-cyan-400 font-bold">65% Load</span>
                </div>
                <div className="w-full bg-dark-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[65%]" />
                </div>
                <p className="text-[11px] text-gray-300">{data.synergists.join(', ')}</p>
              </div>

              {/* Stabilizers */}
              <div className="p-2.5 rounded-xl bg-dark-800/80 border border-white/5 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Joint Stabilizers</span>
                  <span className="font-mono text-purple-400 font-bold">35% Isometric</span>
                </div>
                <div className="w-full bg-dark-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full w-[35%]" />
                </div>
                <p className="text-[11px] text-gray-300">{data.stabilizers.join(', ')}</p>
              </div>
            </div>

            {/* Execution Checklist */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Coach Execution Checklist
              </span>
              <div className="space-y-1 bg-dark-850 p-3 rounded-xl border border-white/5">
                {data.setupCues.map((cue, idx) => (
                  <div key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{cue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags to Avoid */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Critical Injury Traps to Avoid
              </span>
              <div className="space-y-1 bg-red-950/20 p-3 rounded-xl border border-red-500/20">
                {data.mistakesToAvoid.map((mistake, idx) => (
                  <div key={idx} className="text-xs text-red-200 flex items-start gap-2">
                    <span className="text-red-400 font-bold">⚠️</span>
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-dark-850 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs transition-colors"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
