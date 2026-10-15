import React from 'react';
import { Dumbbell, Plus, RefreshCw, Zap, AlertTriangle, Timer, Flame, Sparkles, Activity, Brain } from 'lucide-react';
import { ApiHealthResponse, TrainerPersona } from '../types';

interface HeaderProps {
  health: ApiHealthResponse | null;
  isCheckingHealth: boolean;
  onRefreshHealth: () => void;
  onNewChat: () => void;
  messageCount: number;
  currentPersona: TrainerPersona;
  onChangePersona: (persona: TrainerPersona) => void;
  onToggleTimer: () => void;
  isTimerActive: boolean;
  timerSecondsRemaining?: number;
  onToggleNLPWorkflow: () => void;
  isNLPWorkflowOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  isCheckingHealth,
  onRefreshHealth,
  onNewChat,
  messageCount,
  currentPersona,
  onChangePersona,
  onToggleTimer,
  isTimerActive,
  timerSecondsRemaining,
  onToggleNLPWorkflow,
  isNLPWorkflowOpen,
}) => {
  const personas: { id: TrainerPersona; label: string; icon: React.ReactNode }[] = [
    { id: 'hypertrophy', label: 'Hypertrophy', icon: <Dumbbell className="w-3 h-3" /> },
    { id: 'hiit', label: 'HIIT & Burn', icon: <Flame className="w-3 h-3" /> },
    { id: 'calisthenics', label: 'Bodyweight', icon: <Activity className="w-3 h-3" /> },
    { id: 'science', label: 'Biomechanics', icon: <Sparkles className="w-3 h-3" /> },
  ];

  const getStatusBadge = () => {
    if (isCheckingHealth && !health) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-dark-800 text-gray-400 border border-dark-700">
          <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
          <span>Connecting...</span>
        </span>
      );
    }

    if (health?.status === 'ok' && health?.api_key_configured) {
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neon-500/10 text-neon-400 border border-neon-500/20 shadow-neon-sm"
          title={`Backend connected to ${health.ai_provider} (${health.model})`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-500" />
          </span>
          <span className="hidden lg:inline font-mono text-[11px]">{health.model}</span>
          <span>Online</span>
        </span>
      );
    }

    if (health?.backend === 'online' && !health?.api_key_configured) {
      return (
        <span 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
          title="Backend running, but AI API key is not configured in .env"
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>No API Key</span>
        </span>
      );
    }

    return (
      <button
        onClick={onRefreshHealth}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
        title="Backend unreachable. Click to retry connection."
      >
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span>Offline</span>
        <RefreshCw className={`w-2.5 h-2.5 ml-0.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/5 px-4 py-2.5 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Status row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-neon-500/20 to-dark-800 border border-neon-500/30 text-neon-400 shadow-neon-sm">
              <Dumbbell className="w-4 h-4 -rotate-45" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-neon-400 shadow-[0_0_8px_#c8f53c]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                  FitBot <span className="text-neon-400 font-extrabold">AI</span>
                </h1>
                <div className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider bg-dark-750 text-gray-300 border border-dark-700">
                  <Zap className="w-2.5 h-2.5 text-neon-400" /> PRO
                </div>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                Your Personal AI Gym Trainer
              </p>
            </div>
          </div>

          {/* Right on mobile: status & NLP button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleNLPWorkflow}
              className={`p-1.5 rounded-lg border text-xs ${
                isNLPWorkflowOpen
                  ? 'bg-neon-500 text-dark-950 font-bold border-neon-400'
                  : 'bg-dark-800 text-neon-400 border-neon-500/30'
              }`}
              title="Toggle NLP Workflow"
            >
              <Brain className="w-4 h-4" />
            </button>
            {getStatusBadge()}
          </div>
        </div>

        {/* Center: Persona Switcher */}
        <div className="flex items-center justify-center overflow-x-auto py-0.5 scrollbar-none">
          <div className="flex items-center gap-1 bg-dark-850/80 p-1 rounded-xl border border-white/5">
            {personas.map((p) => {
              const isActive = currentPersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onChangePersona(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-neon-500 text-dark-950 shadow-neon-sm font-bold scale-[1.02]'
                      : 'text-gray-400 hover:text-white hover:bg-dark-750'
                  }`}
                  title={`Switch coach style to ${p.label}`}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Desktop Actions: NLP Workflow, Rest Timer, Status, New Chat */}
        <div className="hidden md:flex items-center gap-2">
          {/* NLP Workflow Trigger Button */}
          <button
            onClick={onToggleNLPWorkflow}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isNLPWorkflowOpen
                ? 'bg-neon-500 text-dark-950 font-bold shadow-neon-sm'
                : 'bg-dark-800 text-neon-400 hover:text-neon-300 hover:bg-dark-750 border border-neon-500/30 shadow-neon-sm'
            }`}
            title="Open NLP Pipeline Inspector (See how NLP processes your question)"
            aria-label="Open NLP Pipeline Inspector"
          >
            <Brain className={`w-3.5 h-3.5 ${isNLPWorkflowOpen ? 'animate-bounce' : 'animate-pulse'}`} />
            <span>NLP Workflow</span>
          </button>

          {/* Rest Timer Button */}
          <button
            onClick={onToggleTimer}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isTimerActive
                ? 'bg-neon-500/20 text-neon-400 border border-neon-500/40 shadow-neon-sm'
                : 'bg-dark-800 text-gray-300 hover:text-white hover:bg-dark-750 border border-white/10'
            }`}
            title="Toggle Workout Rest Timer"
            aria-label="Toggle Workout Rest Timer"
          >
            <Timer className={`w-3.5 h-3.5 ${isTimerActive ? 'animate-spin' : ''}`} />
            <span>
              {isTimerActive && timerSecondsRemaining !== undefined
                ? `${timerSecondsRemaining}s`
                : 'Rest Timer'}
            </span>
          </button>

          {getStatusBadge()}

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            disabled={messageCount === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              messageCount > 0
                ? 'bg-dark-800 text-gray-200 hover:text-white hover:bg-dark-750 border border-white/10 hover:border-neon-500/40 shadow-sm'
                : 'bg-dark-900/60 text-gray-600 border border-white/5 cursor-not-allowed opacity-50'
            }`}
            title="Start a new chat session"
            aria-label="Start a new chat session"
          >
            <Plus className="w-3.5 h-3.5 text-neon-400" />
            <span>New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
