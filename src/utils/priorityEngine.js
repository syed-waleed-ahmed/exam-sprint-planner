import { compareAsc, parseISO } from 'date-fns';

const confidenceScore = {
  not_started: 1,
  in_progress: 2,
  revised: 3,
  confident: 4,
};

export const recommendTodaysTopics = (exams, limit = 5) => {
  const today = new Date();
  const pool = [];

  exams.forEach((exam) => {
    exam.topics.forEach((topic) => {
      const examDate = parseISO(exam.examDate);
      const lastReviewed = topic.lastReviewed ? parseISO(topic.lastReviewed) : null;
      const staleDays = lastReviewed ? Math.floor((today - lastReviewed) / (1000 * 60 * 60 * 24)) : 999;
      pool.push({
        examId: exam.id,
        examName: exam.name,
        examDate,
        topic,
        urgency: compareAsc(examDate, today),
        staleDays,
        confidence: confidenceScore[topic.status] || 1,
      });
    });
  });

  return pool
    .sort((a, b) => {
      const examDiff = a.examDate - b.examDate;
      if (examDiff !== 0) return examDiff;
      if (a.confidence !== b.confidence) return a.confidence - b.confidence;
      return b.staleDays - a.staleDays;
    })
    .slice(0, limit);
};
