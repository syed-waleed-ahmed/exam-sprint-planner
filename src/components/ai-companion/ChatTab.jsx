import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { safeMarkdownSource, sanitizeMultilineInput } from '../../utils/security';
import { safeGetItem } from '../../utils/storage';
import { toUserAIErrorMessage } from '../../hooks/useAI';

const starters = [
  'Explain this topic simply',
  'What are the key points?',
  'Give me a practice question',
  'What might come up in the exam?',
];

export default function ChatTab({ topic, chat, missingKey }) {
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const renderAssistant = (content) => {
    const safe = safeMarkdownSource(content);
    return marked.parse(safe);
  };

  useEffect(() => {
    const topicMessages = chat.getTopicMessages(topic.id);
    setMessages(topicMessages);
    setConversationHistory(topicMessages.map((message) => ({ role: message.role, content: message.content })));
  }, [topic.id]);

  useEffect(() => {
    chat.setTopicMessages(topic.id, messages);
  }, [messages, topic.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const sendMessage = async (userMessage) => {
    const apiKey = safeGetItem('openai_api_key', '', 'chat:api-key');

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Please add your OpenAI API key in Settings first.',
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setIsLoading(true);

    const systemPrompt = `You are a study assistant helping a student prepare for their ${topic?.examSubject ?? topic?.subject ?? 'this subject'} exam on ${topic?.examDate ?? 'an upcoming date'}. The current topic is ${topic?.name ?? 'the selected topic'}. Their confidence level is ${topic?.status ?? 'not started'}. Help them study effectively and answer questions clearly. Use concise Markdown with short sections and bullet points when useful.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...conversationHistory,
            { role: 'user', content: userMessage },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        let message = `HTTP error ${response.status}`;
        if (response.status === 429) {
          message = 'Rate limit reached. Please wait a moment and retry.';
        } else if (response.status >= 500) {
          message = 'AI service is temporarily unavailable. Please try again shortly.';
        } else {
          const errorData = await response.json();
          message = errorData.error?.message || message;
        }
        throw new Error(message);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage, timestamp: new Date().toISOString() }]);
      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage },
      ]);
    } catch (error) {
      const errorMessage = toUserAIErrorMessage(error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, something went wrong: ${errorMessage}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (missingKey) {
    return <div className="rounded-elem border border-warning/40 bg-warning/10 p-3 text-sm text-warning">Add your AI API key in Settings -&gt;</div>;
  }

  return (
    <div className="flex min-h-[60svh] flex-col xl:h-[65vh]">
      <div className="flex-1 space-y-2 overflow-y-auto rounded-elem border border-white/10 bg-slate-900/40 p-3">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted">Suggested prompts:</p>
            <div className="flex flex-wrap gap-2">
              {starters.map((prompt) => (
                <button key={prompt} className="rounded-full border border-white/20 px-3 py-1 text-xs text-muted hover:text-text" onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`max-w-full rounded-elem p-3 text-sm sm:max-w-[88%] ${msg.role === 'user' ? 'ml-auto bg-primary/25' : 'bg-slate-700/40'}`}>
              {msg.role === 'assistant' ? (
                <div className="chat-markdown prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderAssistant(msg.content) }} />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="max-w-[88%] rounded-elem bg-slate-700/40 p-3 text-sm text-muted">
            <p className="mb-1 text-xs uppercase tracking-wide text-secondary">Processing</p>
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-secondary [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-secondary [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <textarea
          className="input-base min-h-[52px] flex-1 resize-y"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              if (!draft.trim() || isLoading) return;
              const msg = sanitizeMultilineInput(draft, 1200);
              setDraft('');
              sendMessage(msg);
            }
          }}
          placeholder="Ask anything about this topic..."
          rows={2}
        />
        <button
          className="btn-primary sm:w-auto"
          onClick={() => {
            const msg = sanitizeMultilineInput(draft, 1200);
            if (!msg) return;
            setDraft('');
            sendMessage(msg);
          }}
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
