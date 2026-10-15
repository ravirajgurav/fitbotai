import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { ChatMessageData } from '../types';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

interface ChatWindowProps {
  messages: ChatMessageData[];
  isLoading: boolean;
  onSelectPrompt: (promptText: string) => void;
  onRetryLastMessage?: () => void;
  onStartRestTimer?: (seconds: number, label?: string) => void;
  onInspectForm?: (exerciseName: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSelectPrompt,
  onRetryLastMessage,
  onStartRestTimer,
  onInspectForm,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll to bottom on new messages or loading state change
  const scrollToBottom = (smooth = true) => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length, isLoading]);

  // Handle scroll detection to show 'Scroll to bottom' button
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isScrolledUp);
  };

  // Find index of last assistant message
  let lastAssistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      lastAssistantIndex = i;
      break;
    }
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-4 sm:px-6 py-4 scroll-smooth"
    >
      <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end">
        {messages.length === 0 ? (
          <WelcomeScreen onSelectPrompt={onSelectPrompt} />
        ) : (
          <div className="space-y-4 py-2">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={msg.id || idx}
                message={msg}
                isLastAssistant={idx === lastAssistantIndex}
                onRetry={idx === lastAssistantIndex ? onRetryLastMessage : undefined}
                onSelectSuggestion={onSelectPrompt}
                onStartRestTimer={onStartRestTimer}
                onInspectForm={onInspectForm}
              />
            ))}

            {isLoading && <TypingIndicator />}

            <div ref={bottomAnchorRef} className="h-2" />
          </div>
        )}
      </div>

      {/* Floating scroll to bottom button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-6 right-8 p-2.5 rounded-full bg-dark-800/90 text-neon-400 border border-neon-500/30 shadow-lg hover:bg-dark-750 transition-all duration-200 z-20 backdrop-blur-md"
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
