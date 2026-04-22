const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o';

const stripMarkdownJson = (raw) => raw.replace(/```json/g, '').replace(/```/g, '').trim();

const getApiKey = () => localStorage.getItem('openai_api_key') || '';

const textFromResponse = (data) => {
  return data.choices?.[0]?.message?.content || '';
};

async function callAnthropic(prompt, { stream = false } = {}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('missing_api_key');

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
    const text = await res.text();
    try {
      const payload = JSON.parse(text);
      const rawError = payload.error || payload.message || message;
      message = typeof rawError === 'string' ? rawError : JSON.stringify(rawError);
    } catch {
      message = text || message;
    }
    throw new Error(message);
  }

  return res;
}

export function useAI() {
  const requestJson = async (prompt) => {
    const res = await callAnthropic(prompt);
    const data = await res.json();
    const text = textFromResponse(data);
    try {
      return JSON.parse(stripMarkdownJson(text));
    } catch {
      throw new Error('Could not parse AI JSON response. Please retry.');
    }
  };

  const requestText = async (prompt) => {
    const res = await callAnthropic(prompt);
    const data = await res.json();
    return textFromResponse(data);
  };

  const streamChat = async (prompt, onDelta) => {
    const res = await callAnthropic(prompt, { stream: true });
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
