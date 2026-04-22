import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'studyLog';

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function useStudyLog() {
  const [studyLog, setStudyLog] = useState(readStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studyLog));
  }, [studyLog]);

  const logSession = (entry) => {
    setStudyLog((prev) => [...prev, { ...entry, id: `${Date.now()}-${Math.random()}` }]);
  };

  const totalMinutesThisWeek = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    return studyLog
      .filter((entry) => new Date(entry.date) >= start)
      .reduce((sum, entry) => sum + (entry.minutesSpent || 0), 0);
  }, [studyLog]);

  return { studyLog, logSession, setStudyLog, totalMinutesThisWeek };
}
