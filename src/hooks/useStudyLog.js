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
