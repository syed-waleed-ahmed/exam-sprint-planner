export const MAX_TEXT_LENGTH = 180;

export function sanitizeTextInput(value, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMultilineInput(value, maxLength = 2000) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeMarkdownSource(value) {
  return escapeHtml(sanitizeMultilineInput(value, 12000));
}

export function safeTopicPayload(topic = {}) {
  return {
    ...topic,
    name: sanitizeTextInput(topic.name || '', 120),
    notes: sanitizeMultilineInput(topic.notes || '', 3000),
  };
}

export function validateImportedBackup(data) {
  if (!data || typeof data !== 'object') return false;

  const allowedTopLevel = [
    'userProfile',
    'exams',
    'studyLog',
    'chatHistory',
    'sprintPlans',
    'socialStudyHub',
    'cloudSnapshot',
  ];

  return Object.keys(data).every((key) => allowedTopLevel.includes(key));
}
