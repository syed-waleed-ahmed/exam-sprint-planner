import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { isValid, parseISO, startOfDay } from 'date-fns';
import { calculateExamReadiness } from '../utils/readiness';
import { dateISO } from '../utils/dateHelpers';
import { sanitizeTextInput, safeTopicPayload } from '../utils/security';
import { safeGetJson, safeSetJson } from '../utils/storage';

const STORAGE_KEY = 'exams';
const SPRINT_KEY = 'sprint_plans';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const initialExams = [];

const readStorage = (key, fallback) => safeGetJson(key, fallback, `exams:read:${key}`);
const parseDateInput = (isoDate) => parseISO(`${isoDate}T00:00:00`);
const isValidExamDateInput = (examDate) => {
  if (!examDate) return false;
  const parsed = parseDateInput(examDate);
  return isValid(parsed) && startOfDay(parsed) >= startOfDay(new Date());
};

export function useExams() {
  const [exams, setExams] = useState(() => readStorage(STORAGE_KEY, initialExams));
  const [sprintPlans, setSprintPlans] = useState(() => readStorage(SPRINT_KEY, {}));

  useEffect(() => {
    safeSetJson(STORAGE_KEY, exams, 'exams:save');
  }, [exams]);

  useEffect(() => {
    safeSetJson(SPRINT_KEY, sprintPlans, 'sprints:save');
  }, [sprintPlans]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setExams(readStorage(STORAGE_KEY, initialExams));
      }
      if (event.key === SPRINT_KEY) {
        setSprintPlans(readStorage(SPRINT_KEY, {}));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const examsWithReadiness = useMemo(
    () => exams.map((exam) => ({ ...exam, readiness: calculateExamReadiness(exam) })),
    [exams]
  );

  const addExam = (examInput) => {
    if (!isValidExamDateInput(examInput.examDate)) return;
    const exam = {
      id: uid(),
      name: sanitizeTextInput(examInput.name, 120),
      subject: sanitizeTextInput(examInput.subject, 80),
      examDate: examInput.examDate,
      importanceLevel: examInput.importanceLevel,
      topics: [],
    };
    setExams((prev) => [...prev, exam]);
  };

  const deleteExam = (examId) => {
    setExams((prev) => prev.filter((exam) => exam.id !== examId));
    setSprintPlans((prev) => {
      const next = { ...prev };
      delete next[examId];
      return next;
    });
  };

  const addTopic = (examId, name, difficulty = 2, importanceLevel = 3) => {
    const topic = {
      id: uid(),
      name: sanitizeTextInput(name, 120),
      difficulty,
      importanceLevel,
      status: 'not_started',
      lastReviewed: '',
      notes: '',
      customDefinitions: [],
      performance: {
        quizScores: [],
        practiceExamScores: [],
      },
      aiContent: {
        flashcards: [],
        quiz: [],
        mindmap: null,
        summary: '',
        explanationLevels: {},
        practiceExam: [],
        reviewSchedule: [],
        onDemandQuestions: [],
      },
    };
    setExams((prev) =>
      prev.map((exam) => (exam.id === examId ? { ...exam, topics: [...exam.topics, topic] } : exam))
    );
  };

  const updateTopic = (examId, topicId, updater) => {
    setExams((prev) =>
      prev.map((exam) => {
        if (exam.id !== examId) return exam;
        return {
          ...exam,
          topics: exam.topics.map((topic) => {
            if (topic.id !== topicId) return topic;
            const next = typeof updater === 'function' ? updater(topic) : { ...topic, ...updater };
            const sanitizedNext = safeTopicPayload(next);
            if (topic.status !== 'confident' && next.status === 'confident') {
              confetti({ particleCount: 80, spread: 55, origin: { y: 0.65 } });
            }
            return sanitizedNext;
          }),
        };
      })
    );
  };

  const markReviewed = (examId, topicId) => {
    updateTopic(examId, topicId, (topic) => ({ ...topic, lastReviewed: dateISO(), status: topic.status === 'not_started' ? 'in_progress' : topic.status }));
  };

  const deleteTopic = (examId, topicId) => {
    setExams((prev) =>
      prev.map((exam) =>
        exam.id === examId ? { ...exam, topics: exam.topics.filter((topic) => topic.id !== topicId) } : exam
      )
    );
  };

  const setTopicStatus = (examId, topicId, status) => {
    updateTopic(examId, topicId, { status, lastReviewed: dateISO() });
  };

  const setTopicAiContent = (examId, topicId, key, value) => {
    updateTopic(examId, topicId, (topic) => ({
      ...topic,
      aiContent: {
        ...topic.aiContent,
        [key]: value,
      },
    }));
  };

  const addCustomDefinition = (examId, topicId, definition) => {
    updateTopic(examId, topicId, (topic) => ({
      ...topic,
      customDefinitions: [...(topic.customDefinitions || []), { id: uid(), ...definition }],
    }));
  };

  const logTopicPerformance = (examId, topicId, kind, score) => {
    updateTopic(examId, topicId, (topic) => ({
      ...topic,
      performance: {
        ...(topic.performance || {}),
        [kind]: [...(topic.performance?.[kind] || []), { score, date: new Date().toISOString() }],
      },
    }));
  };

  const updateSprintPlan = (examId, blocks) => {
    setSprintPlans((prev) => ({ ...prev, [examId]: blocks }));
  };

  return {
    exams: examsWithReadiness,
    addExam,
    deleteExam,
    addTopic,
    updateTopic,
    markReviewed,
    deleteTopic,
    setTopicStatus,
    setTopicAiContent,
    addCustomDefinition,
    logTopicPerformance,
    sprintPlans,
    updateSprintPlan,
  };
}
