import { useEffect, useMemo, useState } from 'react';
import { safeGetJson, safeSetJson } from '../utils/storage';

const STORAGE_KEY = 'studyLog';

const readStorage = () => safeGetJson(STORAGE_KEY, [], 'study-log:read');

export function useStudyLog() {
  const [studyLog, setStudyLog] = useState(readStorage);

  useEffect(() => {
    safeSetJson(STORAGE_KEY, studyLog, 'study-log:save');
  }, [studyLog]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      setStudyLog(readStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const logSession = (entry) => {
    setStudyLog((prev) => [
      ...prev,
      {
        mood: 'neutral',
        efficiencyScore: entry.minutesSpent || 0,
        ...entry,
        id: `${Date.now()}-${Math.random()}`,
      },
    ]);
  };

  const logMood = (mood, note = '') => {
    const today = new Date().toISOString().slice(0, 10);
    setStudyLog((prev) => {
      const todayIndexes = prev
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => new Date(entry.date).toISOString().slice(0, 10) === today);

      if (todayIndexes.length === 0) {
        return [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            date: new Date().toISOString(),
            topicId: 'mood-checkin',
            examId: 'wellbeing',
            minutesSpent: 0,
            sessionType: 'mood-checkin',
            mood,
            note,
            efficiencyScore: 0,
          },
        ];
      }

      return prev.map((entry, index) =>
        todayIndexes.some((item) => item.index === index) ? { ...entry, mood, note: note || entry.note || '' } : entry
      );
    });
  };

  const totalMinutesThisWeek = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    return studyLog
      .filter((entry) => new Date(entry.date) >= start)
      .reduce((sum, entry) => sum + (entry.minutesSpent || 0), 0);
  }, [studyLog]);

  return { studyLog, logSession, logMood, setStudyLog, totalMinutesThisWeek };
}
