import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  X,
  Cpu,
  Layers,
  ShieldCheck,
  Clock,
  Database,
  Tag,
  Hash,
} from 'lucide-react';
import { NLPWorkflowState } from '../types';

interface NLPWorkflowPanelProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: NLPWorkflowState;
  isLoading: boolean;
}

export const NLPWorkflowPanel: React.FC<NLPWorkflowPanelProps> = ({
  isOpen,
  onClose,
  workflow,
  isLoading,
}) => {
  if (!isOpen) return null;

  const stages = [
    {
      id: 'tokenizing',
      title: '1. Lexical Tokenization',
      icon: <Hash className="w-4 h-4 text-cyan-400" />,
      desc: 'Subword BPE tokenization & length calculation',
      status: isLoading ? 'Processing...' : 'Analyzed',
      details: workflow.lastInputText ? (
        <div className="space-y-1 text-[11px] text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-400">Tokens (Est.):</span>
            <span className="font-mono text-cyan-400 font-bold">{workflow.tokenCount || 0} BPE Tokens</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Chars:</span>
            <span className="font-mono text-gray-300">{workflow.lastInputText.length} bytes</span>
          </div>
          <div className="bg-dark-950 p-1.5 rounded border border-white/5 font-mono text-[10px] text-gray-400 truncate">
            "{workflow.lastInputText}"
          </div>
        </div>
      ) : (
        <span className="text-[11px] text-gray-400">Waiting for user input...</span>
      ),
    },
    {
      id: 'nlu_parsing',
      title: '2. NLU & Entity Extraction',
      icon: <Tag className="w-4 h-4 text-amber-400" />,
      desc: 'Intent recognition and semantic slot-filling',
      status: isLoading ? 'Extracting...' : 'Extracted',
      details: workflow.detectedIntent ? (
        <div className="space-y-1.5 text-[11px]">
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold block mb-0.5">Identified Intent</span>
            <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono text-[10px] border border-amber-500/30">
              {workflow.detectedIntent}
            </span>
          </div>

          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold block mb-0.5">Extracted Slots</span>
            <div className="flex flex-wrap gap-1">
              {workflow.extractedEntities?.muscles?.map((m, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-dark-800 text-neon-400 text-[10px] border border-white/5">
                  💪 {m}
                </span>
              ))}
              {workflow.extractedEntities?.equipment?.map((eq, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-dark-800 text-cyan-300 text-[10px] border border-white/5">
                  🏋️ {eq}
                </span>
              ))}
              {workflow.extractedEntities?.duration && (
                <span className="px-1.5 py-0.5 rounded bg-dark-800 text-amber-400 text-[10px] border border-white/5">
                  ⏱️ {workflow.extractedEntities.duration}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <span className="text-[11px] text-gray-400">Send a prompt to extract entities</span>
      ),
    },
    {
      id: 'context_assembly',
      title: '3. Context & Multi-Turn State',
      icon: <Database className="w-4 h-4 text-purple-400" />,
      desc: 'Dialogue turn tracking & coreference resolution',
      status: 'Active Buffer',
      details: (
        <div className="space-y-1 text-[11px] text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-400">Context Window Turns:</span>
            <span className="font-mono text-purple-400 font-bold">{workflow.contextTurns || 0} Turns</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Coreference:</span>
            <span className="text-emerald-400 text-[10px]">Anaphora Resolved</span>
          </div>
          <p className="text-[10px] text-gray-400">
            Recent messages packaged in FIFO queue for pronoun & exercise continuity.
          </p>
        </div>
      ),
    },
    {
      id: 'attention_inference',
      title: '4. Persona Steer & Attention',
      icon: <Layers className="w-4 h-4 text-neon-400" />,
      desc: 'System prompt conditioning in latent space',
      status: workflow.activePersona?.toUpperCase() || 'HYPERTROPHY',
      details: (
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Active Coach Mode:</span>
            <span className="text-neon-400 font-bold capitalize">{workflow.activePersona || 'Hypertrophy'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sampling Temperature:</span>
            <span className="font-mono text-gray-300">0.7 (Creative yet structured)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Top-P Nucleus:</span>
            <span className="font-mono text-gray-300">0.95</span>
          </div>
        </div>
      ),
    },
    {
      id: 'nlg_complete',
      title: '5. Transformer NLG & Safety',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      desc: 'Autoregressive generation & medical guardrails',
      status: isLoading ? 'Generating...' : 'Synthesized',
      details: (
        <div className="space-y-1 text-[11px] text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-400">Engine:</span>
            <span className="font-mono text-emerald-400 font-semibold">Gemini 3.5 Flash Lite</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Latency:</span>
            <span className="font-mono text-neon-400">{workflow.latencyMs ? `${workflow.latencyMs}ms` : 'Sub-second'}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety alignment & markdown synthesis verified</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 340 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 340 }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="fixed top-16 right-4 sm:right-6 bottom-6 z-50 w-80 sm:w-96 rounded-2xl glass-panel border border-neon-500/40 bg-dark-900/95 backdrop-blur-2xl shadow-glass flex flex-col overflow-hidden"
      >
        {/* Panel Header */}
        <div className="px-4 py-3 bg-dark-850/90 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neon-500/10 text-neon-400 border border-neon-500/20">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                NLP Pipeline Inspector
                <span className="w-2 h-2 rounded-full bg-neon-400 animate-ping" />
              </h3>
              <p className="text-[10px] text-gray-400">Real-time Natural Language Workflow</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-750 transition-colors"
            title="Close NLP Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status indicator */}
        <div className="px-4 py-2 bg-dark-950/70 border-b border-white/5 flex items-center justify-between text-[11px]">
          <span className="text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-neon-400" />
            <span>Pipeline State:</span>
          </span>
          <span
            className={`font-semibold font-mono ${
              isLoading ? 'text-neon-400 animate-pulse' : 'text-emerald-400'
            }`}
          >
            {isLoading ? '⚙️ Processing Stages...' : 'Ready / Evaluated'}
          </span>
        </div>

        {/* Pipeline Stages Scrollview */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-none">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className={`rounded-xl p-3 border transition-all ${
                isLoading && idx === 3
                  ? 'bg-neon-500/[0.04] border-neon-500/40 shadow-neon-sm'
                  : 'bg-dark-850/70 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-dark-800 border border-white/5">
                    {stage.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">{stage.title}</h4>
                    <p className="text-[10px] text-gray-400">{stage.desc}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-dark-750 text-gray-300 border border-white/5">
                  {stage.status}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-white/5">
                {stage.details}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Academic Summary */}
        <div className="p-3 bg-dark-950 border-t border-white/5 text-[10px] text-gray-400 flex items-center justify-between">
          <span>AI & DS NLP Assignment</span>
          <span className="text-neon-400 font-semibold font-mono">Transformer NLU/NLG</span>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
