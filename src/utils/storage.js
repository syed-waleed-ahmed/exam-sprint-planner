const WARNING_EVENT = 'exam-sprint:storage-warning';

function emitWarning(message, source = 'storage') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(WARNING_EVENT, {
      detail: {
        message,
        source,
        at: new Date().toISOString(),
      },
    })
  );
}

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

export function getStorageWarningEventName() {
  return WARNING_EVENT;
}

export function safeGetItem(key, fallback = '', source = 'storage:get') {
  try {
    const storage = getStorage();
    if (!storage) return fallback;
    const value = storage.getItem(key);
    return value ?? fallback;
  } catch {
    emitWarning('Could not access local storage. Falling back to in-memory defaults.', source);
    return fallback;
  }
}

export function safeGetJson(key, fallback, source = 'storage:get-json') {
  const raw = safeGetItem(key, '', source);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    emitWarning(`Saved data for "${key}" is corrupted. Using safe defaults.`, source);
    return fallback;
  }
}

export function safeSetItem(key, value, source = 'storage:set') {
  try {
    const storage = getStorage();
    if (!storage) {
      emitWarning('Local storage is unavailable. Changes will not persist.', source);
      return false;
    }
    storage.setItem(key, value);
    return true;
  } catch {
    emitWarning('Could not save data to local storage (quota or permission issue).', source);
    return false;
  }
}

export function safeSetJson(key, value, source = 'storage:set-json') {
  try {
    return safeSetItem(key, JSON.stringify(value), source);
  } catch {
    emitWarning(`Could not serialize data for "${key}".`, source);
    return false;
  }
}

export function safeClear(source = 'storage:clear') {
  try {
    const storage = getStorage();
    if (!storage) {
      emitWarning('Local storage is unavailable. Nothing to clear.', source);
      return false;
    }
    storage.clear();
    return true;
  } catch {
    emitWarning('Could not clear local storage.', source);
    return false;
  }
}