import { useEffect, useState } from 'react';
import { safeGetJson, safeSetJson } from '../utils/storage';

const STORAGE_KEY = 'chatHistory';

const readStorage = () => safeGetJson(STORAGE_KEY, [], 'chat-history:read');

export function useChatHistory() {
  const [chatHistory, setChatHistory] = useState(readStorage);

  useEffect(() => {
    safeSetJson(STORAGE_KEY, chatHistory, 'chat-history:save');
  }, [chatHistory]);

  const getTopicMessages = (topicId) => {
    return chatHistory.find((item) => item.topicId === topicId)?.messages || [];
  };

  const appendMessage = (topicId, message) => {
    setChatHistory((prev) => {
      const idx = prev.findIndex((item) => item.topicId === topicId);
      if (idx === -1) return [...prev, { topicId, messages: [message] }];
      const next = [...prev];
      next[idx] = { ...next[idx], messages: [...next[idx].messages, message] };
      return next;
    });
  };

  const setTopicMessages = (topicId, messages) => {
    setChatHistory((prev) => {
      const idx = prev.findIndex((item) => item.topicId === topicId);
      if (idx === -1) return [...prev, { topicId, messages }];
      const next = [...prev];
      next[idx] = { ...next[idx], messages };
      return next;
    });
  };

  return { chatHistory, getTopicMessages, appendMessage, setTopicMessages };
}
