const STATUS_SCORE = {
  not_started: 0,
  in_progress: 25,
  revised: 65,
  confident: 100,
};

const DIFFICULTY_WEIGHT = {
  1: 0.7,
  2: 1,
  3: 1.5,
};

export const getStatusScore = (status) => STATUS_SCORE[status] ?? 0;

export const getDifficultyWeight = (difficulty) => DIFFICULTY_WEIGHT[difficulty] ?? 1;

export const calculateExamReadiness = (exam) => {
  if (!exam?.topics?.length) return 0;
  const weighted = exam.topics.map((topic) => getStatusScore(topic.status) * getDifficultyWeight(topic.difficulty));
  const totalWeights = exam.topics.reduce((sum, topic) => sum + getDifficultyWeight(topic.difficulty), 0);
  return Math.round(weighted.reduce((a, b) => a + b, 0) / totalWeights);
};

export const calculateOverallReadiness = (exams) => {
  if (!exams?.length) return 0;
  const total = exams.reduce((sum, exam) => sum + calculateExamReadiness(exam), 0);
  return Math.round(total / exams.length);
};

export const masteryCount = (exams) =>
  exams.reduce((count, exam) => count + exam.topics.filter((topic) => topic.status === 'confident').length, 0);

export const confidenceDistribution = (exam) => {
  const base = { not_started: 0, in_progress: 0, revised: 0, confident: 0 };
  for (const topic of exam.topics || []) base[topic.status] += 1;
  return base;
};
