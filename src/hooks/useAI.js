import { safeGetItem } from '../utils/storage';

const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o';

const stripMarkdownJson = (raw) => raw.replace(/```json/g, '').replace(/```/g, '').trim();

const getApiKey = () => safeGetItem('openai_api_key', '', 'ai:api-key');

class AIRequestError extends Error {
  constructor(message, { status = 0, code = 'ai_error' } = {}) {
    super(message);
    this.name = 'AIRequestError';
    this.status = status;
    this.code = code;
  }
}

export function toUserAIErrorMessage(error) {
  if (error instanceof AIRequestError) {
    if (error.code === 'missing_api_key') return 'Add your OpenAI API key in Settings to continue.';
    if (error.code === 'rate_limited') return 'Rate limit reached. Please wait a moment and retry.';
    if (error.code === 'server_error') return 'AI service is temporarily unavailable. Please try again shortly.';
    return error.message || 'AI request failed. Please retry.';
  }

  const msg = error instanceof Error ? error.message : String(error || 'Unknown error');
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) {
    return 'Network error while contacting AI service. Check your connection and try again.';
  }
  return msg || 'Unexpected error while processing AI request.';
}

const textFromResponse = (data) => {
  return data.choices?.[0]?.message?.content || '';
};

async function callOpenAI(prompt, { stream = false } = {}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new AIRequestError('Missing API key', { code: 'missing_api_key' });

  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: 1000,
      stream,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    let message = 'API call failed';
    let code = 'api_error';
    if (res.status === 429) {
      code = 'rate_limited';
      message = 'Rate limit reached. Please wait a moment and retry.';
    }
    if (res.status >= 500) {
      code = 'server_error';
      message = 'AI service is temporarily unavailable. Please try again shortly.';
    }
    const text = await res.text();
    try {
      const payload = JSON.parse(text);
      if (code === 'api_error') {
        const rawError = payload.error || payload.message || message;
        message = typeof rawError === 'string' ? rawError : JSON.stringify(rawError);
      }
    } catch {
      if (code === 'api_error') {
        message = text || message;
      }
    }
    throw new AIRequestError(message, { status: res.status, code });
  }

  return res;
}

export function useAI() {
  const requestJson = async (prompt) => {
    try {
      const res = await callOpenAI(prompt);
      const data = await res.json();
      const text = textFromResponse(data);
      return JSON.parse(stripMarkdownJson(text));
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Could not parse AI JSON response. Please retry.');
      }
      throw new Error(toUserAIErrorMessage(error));
    }
  };

  const requestText = async (prompt) => {
    try {
      const res = await callOpenAI(prompt);
      const data = await res.json();
      return textFromResponse(data);
    } catch (error) {
      throw new Error(toUserAIErrorMessage(error));
    }
  };

  const streamChat = async (prompt, onDelta) => {
    const res = await callOpenAI(prompt, { stream: true });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let partial = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      partial += chunk;
      const lines = partial.split('\n');
      partial = lines.pop() || '';

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) return;
        const payload = trimmed.replace(/^data:\s*/, '');
        if (!payload || payload === '[DONE]') return;
        try {
          const evt = JSON.parse(payload);
          if (evt.choices?.[0]?.delta?.content) onDelta(evt.choices[0].delta.content);
        } catch {
          // Ignore malformed SSE chunks.
        }
      });
    }
  };

  return { requestJson, requestText, streamChat, hasApiKey: !!getApiKey() };
}
