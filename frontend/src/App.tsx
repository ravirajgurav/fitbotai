import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { RestTimer } from './components/RestTimer';
import { NLPWorkflowPanel } from './components/NLPWorkflowPanel';
import { FormInspectorModal } from './components/FormInspectorModal';
import {
  ChatMessageData,
  ApiHealthResponse,
  TrainerPersona,
  RestTimerState,
  NLPWorkflowState,
} from './types';
import { sendChatMessage, checkApiHealth } from './services/chatApi';
import { analyzeNLPInput } from './utils/nlpAnalyzer';

export const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(true);
  const [currentPersona, setCurrentPersona] = useState<TrainerPersona>('hypertrophy');

  // Form Inspector Modal
  const [isFormInspectorOpen, setIsFormInspectorOpen] = useState<boolean>(false);
  const [inspectExerciseName, setInspectExerciseName] = useState<string>('bench');

  // NLP Workflow Inspector State (open by default so user immediately sees it in right corner)
  const [isNLPWorkflowOpen, setIsNLPWorkflowOpen] = useState<boolean>(true);
  const [nlpWorkflow, setNlpWorkflow] = useState<NLPWorkflowState>({
    currentStage: 'idle',
    contextTurns: 0,
    activePersona: 'hypertrophy',
  });

  // Rest Timer State
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isActive: false,
    secondsRemaining: 90,
    totalSeconds: 90,
    isRunning: false,
    label: '90s Rest',
  });

  // Health check callback
  const fetchHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const data = await checkApiHealth();
      setHealth(data);
    } catch {
      setHealth({
        status: 'error',
        backend: 'offline',
        ai_provider: 'unknown',
        model: 'none',
        api_key_configured: false,
        message: 'Could not connect to backend server',
      });
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  // Initial health check on mount and interval
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Handler for starting rest timer from message or card
  const handleStartRestTimer = (seconds: number, label?: string) => {
    setRestTimer({
      isActive: true,
      totalSeconds: seconds,
      secondsRemaining: seconds,
      isRunning: true,
      label: label || `${seconds}s Rest`,
    });
  };

  // Toggle timer modal from header or input
  const handleToggleTimer = () => {
    setRestTimer((prev) => ({
      ...prev,
      isActive: !prev.isActive,
      isRunning: !prev.isActive ? true : prev.isRunning,
    }));
  };

  // Send message handler with live NLP workflow tracing
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const startTime = performance.now();

    // 1. Run client-side NLP analysis for immediate workflow visualization
    const nlpAnalysis = analyzeNLPInput(text.trim(), messages.length, currentPersona);
    setNlpWorkflow({
      ...nlpAnalysis,
      currentStage: 'tokenizing',
    });

    const userMsg: ChatMessageData = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setIsLoading(true);

    // Simulate pipeline stage advance for education
    setTimeout(() => {
      setNlpWorkflow((prev) => ({ ...prev, currentStage: 'nlu_parsing' }));
    }, 250);

    setTimeout(() => {
      setNlpWorkflow((prev) => ({ ...prev, currentStage: 'context_assembly' }));
    }, 500);

    try {
      const response = await sendChatMessage(text.trim(), messages, currentPersona);
      const latency = Math.round(performance.now() - startTime);

      const aiMsg: ChatMessageData = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        persona: currentPersona,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Finalize NLP workflow state
      setNlpWorkflow((prev) => ({
        ...prev,
        currentStage: 'nlg_complete',
        latencyMs: latency,
        contextTurns: currentMessages.length,
      }));
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while communicating with FitBot AI.';

      const failedMsg: ChatMessageData = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Trainer Alert**: ${errorMsg}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, failedMsg]);
      setNlpWorkflow((prev) => ({ ...prev, currentStage: 'idle' }));
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat / New chat
  const handleNewChat = () => {
    if (isLoading) return;
    setMessages([]);
    setNlpWorkflow({
      currentStage: 'idle',
      contextTurns: 0,
      activePersona: currentPersona,
    });
  };

  // Retry last message
  const handleRetryLast = () => {
    if (isLoading || messages.length === 0) return;

    let lastUserMessage: ChatMessageData | null = null;
    let cutoffIndex = -1;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessage = messages[i];
        cutoffIndex = i;
        break;
      }
    }

    if (!lastUserMessage || cutoffIndex === -1) return;

    const historyBeforeRetry = messages.slice(0, cutoffIndex);
    setMessages(historyBeforeRetry);
    handleSendMessage(lastUserMessage.content);
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-dark-950 text-gray-100 overflow-hidden font-sans">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-neon-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-neon-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-neon-500/5 blur-[140px] rounded-full" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Minimal Header with Persona selector and NLP Workflow toggle */}
        <Header
          health={health}
          isCheckingHealth={isCheckingHealth}
          onRefreshHealth={fetchHealth}
          onNewChat={handleNewChat}
          messageCount={messages.length}
          currentPersona={currentPersona}
          onChangePersona={setCurrentPersona}
          onToggleTimer={handleToggleTimer}
          isTimerActive={restTimer.isActive}
          timerSecondsRemaining={restTimer.secondsRemaining}
          onToggleNLPWorkflow={() => setIsNLPWorkflowOpen((prev) => !prev)}
          isNLPWorkflowOpen={isNLPWorkflowOpen}
        />

        {/* Conversation Area */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSelectPrompt={handleSendMessage}
          onRetryLastMessage={handleRetryLast}
          onStartRestTimer={handleStartRestTimer}
          onInspectForm={(name) => {
            setInspectExerciseName(name);
            setIsFormInspectorOpen(true);
          }}
        />

        {/* Biomechanical Form & Muscle Engagement Modal */}
        <FormInspectorModal
          isOpen={isFormInspectorOpen}
          onClose={() => setIsFormInspectorOpen(false)}
          exerciseName={inspectExerciseName}
        />

        {/* NLP Workflow Inspector Panel (Right Corner) */}
        <NLPWorkflowPanel
          isOpen={isNLPWorkflowOpen}
          onClose={() => setIsNLPWorkflowOpen(false)}
          workflow={nlpWorkflow}
          isLoading={isLoading}
        />

        {/* Floating Rest Timer Widget */}
        <RestTimer
          timer={restTimer}
          onUpdateTimer={setRestTimer}
          onClose={() => setRestTimer((prev) => ({ ...prev, isActive: false }))}
        />

        {/* Fixed Bottom Input Area with Voice dictation and Prompt Builder */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={false}
          onOpenTimer={handleToggleTimer}
        />
      </div>
    </div>
  );
};

export default App;
