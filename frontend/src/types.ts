export type Role = 'user' | 'assistant' | 'system';

export type TrainerPersona = 'hypertrophy' | 'hiit' | 'calisthenics' | 'science';

export interface PersonaConfig {
  id: TrainerPersona;
  name: string;
  badge: string;
  tagline: string;
  description: string;
}

export interface ChatMessageData {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  isError?: boolean;
  persona?: TrainerPersona;
  suggestions?: string[];
}

export interface ApiHealthResponse {
  status: 'ok' | 'degraded' | 'error';
  backend: string;
  ai_provider: string;
  model: string;
  api_key_configured: boolean;
  message?: string;
}

export interface ChatRequestPayload {
  message: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  persona?: TrainerPersona;
}

export interface ChatResponsePayload {
  reply: string;
  model?: string;
  persona?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface PromptCard {
  id: string;
  title: string;
  prompt: string;
  subtitle: string;
  category: string;
}

export interface RestTimerState {
  isActive: boolean;
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  label?: string;
}

export interface NLPWorkflowState {
  currentStage: 'idle' | 'tokenizing' | 'nlu_parsing' | 'context_assembly' | 'attention_inference' | 'nlg_complete';
  lastInputText?: string;
  tokenCount?: number;
  detectedIntent?: string;
  extractedEntities?: {
    muscles?: string[];
    equipment?: string[];
    duration?: string;
    level?: string;
    constraints?: string[];
  };
  contextTurns?: number;
  activePersona?: TrainerPersona;
  latencyMs?: number;
  completionTokens?: number;
}

