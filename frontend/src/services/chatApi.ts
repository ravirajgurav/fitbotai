import { ChatMessageData, ChatRequestPayload, ChatResponsePayload, ApiHealthResponse, TrainerPersona } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export class ChatApiError extends Error {
  statusCode?: number;
  details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ChatApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function checkApiHealth(): Promise<ApiHealthResponse> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Health check returned ${res.status}`);
    }

    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Backend unreachable';
    return {
      status: 'error',
      backend: 'offline',
      ai_provider: 'unknown',
      model: 'none',
      api_key_configured: false,
      message: msg,
    };
  }
}

export async function sendChatMessage(
  message: string,
  history: ChatMessageData[],
  persona?: TrainerPersona
): Promise<ChatResponsePayload> {
  // Format relevant history (filter out errors and keep user/assistant pairs)
  const formattedHistory = history
    .filter((msg) => !msg.isError && (msg.role === 'user' || msg.role === 'assistant'))
    .map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

  const payload: ChatRequestPayload = {
    message,
    history: formattedHistory,
    persona: persona || 'hypertrophy',
  };

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage =
        data?.detail ||
        data?.error ||
        `Server error (${res.status}): Failed to get a response from FitBot AI`;
      throw new ChatApiError(errorMessage, res.status, data);
    }

    if (!data || !data.reply) {
      throw new ChatApiError('Received an empty response from FitBot AI');
    }

    return data as ChatResponsePayload;
  } catch (error: unknown) {
    if (error instanceof ChatApiError) {
      throw error;
    }
    const messageText = error instanceof Error ? error.message : 'Network request failed';
    throw new ChatApiError(
      `Unable to reach FitBot AI backend. Please verify the FastAPI server is running. (${messageText})`
    );
  }
}
