import { compareAsc, differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';

const confidenceWeight = {
  not_started: 0.25,
  in_progress: 0.55,
  revised: 0.8,
  confident: 1,
};

const moodWeight = {
  drained: 0.65,
  distracted: 0.8,
  neutral: 1,
  focused: 1.12,
  energised: 1.2,
};

const dateKey = (value) => new Date(value).toISOString().slice(0, 10);

export function getExamTopicMap(exams) {
  return Object.fromEntries(
    exams.flatMap((exam) =>
      exam.topics.map((topic) => [
        topic.id,
        { examId: exam.id, examName: exam.name, examDate: exam.examDate, subject: exam.subject, topic },
      ])
    )
  );
}

export function getMissedStudyDays(studyLog, examId, days = 7) {
  const today = new Date();
  const seenDays = new Set(
    studyLog
      .filter((entry) => !examId || entry.examId === examId)
      .map((entry) => dateKey(entry.date))
  );

  let missed = 0;
  for (let i = 1; i <= days; i += 1) {
    const day = subDays(today, i);
    if (!seenDays.has(dateKey(day))) {
      missed += 1;
    }
  }
  return missed;
}

export function getStudyStreak(studyLog) {
  const days = new Set(studyLog.map((entry) => dateKey(entry.date)));
  let streak = 0;
  const cursor = new Date();

  while (days.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getAchievements(exams, studyLog) {
  const totalTopics = exams.reduce((sum, exam) => sum + exam.topics.length, 0);
  const confidentTopics = exams.reduce((sum, exam) => sum + exam.topics.filter((topic) => topic.status === 'confident').length, 0);
  const streak = getStudyStreak(studyLog);
  const totalMinutes = studyLog.reduce((sum, entry) => sum + (entry.minutesSpent || 0), 0);
  const quizWins = studyLog.filter((entry) => typeof entry.sessionType === 'string' && entry.sessionType.startsWith('quiz-') && Number(entry.sessionType.split('-')[1]?.split('/')[0] || 0) >= 4).length;

  return [
    {
      id: 'streak-3',
      label: 'Consistency Starter',
      detail: 'Study for 3 days in a row',
      unlocked: streak >= 3,
      progress: `${Math.min(streak, 3)}/3`,
    },
    {
      id: 'minutes-600',
      label: 'Deep Work Builder',
      detail: 'Accumulate 10 focused study hours',
      unlocked: totalMinutes >= 600,
      progress: `${Math.min(totalMinutes, 600)}/600 min`,
    },
    {
      id: 'mastery-5',
      label: 'Mastery Run',
      detail: 'Reach confident status on 5 topics',
      unlocked: confidentTopics >= 5,
      progress: `${Math.min(confidentTopics, 5)}/5`,
    },
    {
      id: 'quiz-ace',
      label: 'Quiz Ace',
      detail: 'Score 4/5 or better on 3 quizzes',
      unlocked: quizWins >= 3,
      progress: `${Math.min(quizWins, 3)}/3`,
    },
    {
      id: 'coverage',
      label: 'Coverage Champion',
      detail: 'Finish at least half of all tracked topics',
      unlocked: totalTopics > 0 && confidentTopics >= Math.ceil(totalTopics / 2),
      progress: `${confidentTopics}/${Math.max(Math.ceil(totalTopics / 2), 1)}`,
    },
  ];
}

export function getEfficiencyFeedback(studyLog, dailyGoalMinutes = 90) {
  const last7 = studyLog.filter((entry) => new Date(entry.date) >= subDays(new Date(), 7));
  const totalMinutes = last7.reduce((sum, entry) => sum + (entry.minutesSpent || 0), 0);
  const studyDays = new Set(last7.map((entry) => dateKey(entry.date))).size;
  const avgSession = last7.length ? Math.round(totalMinutes / last7.length) : 0;
  const targetMinutes = dailyGoalMinutes * 7;
  const completion = Math.round((totalMinutes / Math.max(targetMinutes, 1)) * 100);

  const suggestions = [];
  if (studyDays <= 3) suggestions.push('Spread work across more days to reduce cramming pressure.');
  if (avgSession > 75) suggestions.push('Break long sessions into shorter sprints with recovery blocks.');
  if (completion < 70) suggestions.push('Trim daily goals slightly or protect a fixed study window each day.');
  if (completion >= 100) suggestions.push('You are exceeding target pace. Use the extra margin for revision and mocks.');

  return {
    totalMinutes,
    studyDays,
    avgSession,
    completion,
    suggestions: suggestions.length ? suggestions : ['Your study pace is balanced. Keep the same cadence and add one revision checkpoint.'],
  };
}

export function getPersonalizedRecommendations(exams, studyLog, userProfile) {
  const today = new Date();
  const recommendations = [];
  const recentByTopic = {};

  studyLog.forEach((entry) => {
    if (!recentByTopic[entry.topicId]) recentByTopic[entry.topicId] = [];
    recentByTopic[entry.topicId].push(entry);
  });

  exams.forEach((exam) => {
    exam.topics.forEach((topic) => {
      const history = recentByTopic[topic.id] || [];
      const avgMinutes = history.length
        ? history.reduce((sum, item) => sum + (item.minutesSpent || 0), 0) / history.length
        : 0;
      const lastReviewed = topic.lastReviewed ? parseISO(topic.lastReviewed) : null;
      const staleDays = lastReviewed ? differenceInCalendarDays(today, lastReviewed) : 14;
      const daysToExam = Math.max(differenceInCalendarDays(parseISO(exam.examDate), today), 1);
      const weakQuiz = history.some((item) => typeof item.sessionType === 'string' && item.sessionType.startsWith('quiz-') && Number(item.sessionType.split('-')[1]?.split('/')[0] || 0) <= 2);
      const score =
        (4 - (topic.difficulty || 2)) * -0.35 +
        staleDays * 0.65 +
        (4 - (confidenceWeight[topic.status] || 0.25) * 4) * 1.1 +
        (daysToExam <= 5 ? 4 : daysToExam <= 10 ? 2 : 0) +
        (weakQuiz ? 2.5 : 0) -
        Math.min(avgMinutes / 20, 2);

      recommendations.push({
        examId: exam.id,
        examName: exam.name,
        examDate: exam.examDate,
        topicId: topic.id,
        topicName: topic.name,
        subject: exam.subject,
        score,
        reason:
          weakQuiz
            ? 'Recent quiz performance suggests this needs another pass.'
            : staleDays >= 5
              ? `This topic has been idle for ${staleDays} day(s).`
              : daysToExam <= 7
                ? `This exam is coming up in ${daysToExam} day(s).`
                : 'A focused review now would improve retention.',
        estimatedMinutes: Math.max(20, Math.round(((topic.difficulty || 2) * 20 + userProfile.dailyGoalMinutes * 0.15) / 5) * 5),
      });
    });
  });

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
}

export function getMoodAnalytics(studyLog) {
  const moodBuckets = {};
  const byDay = {};

  studyLog.forEach((entry) => {
    const mood = entry.mood || 'neutral';
    if (!moodBuckets[mood]) {
      moodBuckets[mood] = { mood, sessions: 0, minutes: 0, weightedMinutes: 0 };
    }
    moodBuckets[mood].sessions += 1;
    moodBuckets[mood].minutes += entry.minutesSpent || 0;
    moodBuckets[mood].weightedMinutes += (entry.minutesSpent || 0) * (moodWeight[mood] || 1);

    const key = dateKey(entry.date);
    if (!byDay[key]) byDay[key] = { date: key, minutes: 0, mood: mood, sessionCount: 0 };
    byDay[key].minutes += entry.minutesSpent || 0;
    byDay[key].sessionCount += 1;
    byDay[key].mood = entry.mood || byDay[key].mood || 'neutral';
  });

  const moodBreakdown = Object.values(moodBuckets).map((bucket) => ({
    mood: bucket.mood,
    avgMinutes: bucket.sessions ? Math.round(bucket.minutes / bucket.sessions) : 0,
    efficiency: bucket.minutes ? Math.round((bucket.weightedMinutes / bucket.minutes) * 100) : 100,
  }));

  const bestMood = [...moodBreakdown].sort((a, b) => b.efficiency - a.efficiency)[0];

  return {
    moodBreakdown,
    dailyMoodSeries: Object.values(byDay)
      .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))
      .map((item) => ({
        ...item,
        shortDate: format(parseISO(item.date), 'MM-dd'),
      })),
    bestMood,
  };
}

export function getComparativeTrend(studyLog) {
  const today = new Date();
  const currentStart = subDays(today, 13);
  const previousStart = subDays(today, 27);
  const previousEnd = subDays(today, 14);

  const current = studyLog.filter((entry) => new Date(entry.date) >= currentStart);
  const previous = studyLog.filter((entry) => new Date(entry.date) >= previousStart && new Date(entry.date) <= previousEnd);

  return {
    currentMinutes: current.reduce((sum, entry) => sum + (entry.minutesSpent || 0), 0),
    previousMinutes: previous.reduce((sum, entry) => sum + (entry.minutesSpent || 0), 0),
    currentSessions: current.length,
    previousSessions: previous.length,
  };
}

export function getReviewSchedule(topic, examDate, studyLog) {
  const history = studyLog.filter((entry) => entry.topicId === topic.id);
  const lastDate = topic.lastReviewed || history[history.length - 1]?.date || new Date().toISOString();
  const weakQuizCount = history.filter((entry) => typeof entry.sessionType === 'string' && entry.sessionType.startsWith('quiz-') && Number(entry.sessionType.split('-')[1]?.split('/')[0] || 0) <= 2).length;
  const multiplier = weakQuizCount > 0 || topic.status === 'not_started' ? 1 : topic.status === 'in_progress' ? 2 : topic.status === 'revised' ? 4 : 6;
  const intervals = [1, 3, 7].map((base) => base * multiplier);
  const exam = parseISO(examDate);

  return intervals.map((offset, index) => {
    const suggested = new Date(lastDate);
    suggested.setDate(suggested.getDate() + offset);
    return {
      id: `${topic.id}-review-${index + 1}`,
      label: index === 0 ? 'Refresh' : index === 1 ? 'Active recall' : 'Exam simulation',
      date: suggested > exam ? examDate : suggested.toISOString().slice(0, 10),
    };
  });
}

export function getSmartReminders(exams, studyLog, userProfile, online = true) {
  const reminders = [];
  const todayKey = dateKey(new Date());
  const studiedToday = studyLog.some((entry) => dateKey(entry.date) === todayKey);
  const streak = getStudyStreak(studyLog);
  const nearestExam = [...exams]
    .sort((a, b) => compareAsc(parseISO(a.examDate), parseISO(b.examDate)))
    .find((exam) => differenceInCalendarDays(parseISO(exam.examDate), new Date()) >= 0);

  if (!studiedToday) {
    reminders.push({
      id: 'daily-focus',
      title: 'Protect today’s study block',
      detail: `Aim for ${userProfile.dailyGoalMinutes} focused minutes during your ${userProfile.preferredStudyWindow || 'preferred study window'}.`,
      kind: 'habit',
    });
  }

  if (nearestExam) {
    const daysLeft = Math.max(differenceInCalendarDays(parseISO(nearestExam.examDate), new Date()), 0);
    reminders.push({
      id: 'exam-alert',
      title: `${nearestExam.name} is approaching`,
      detail: daysLeft <= 3 ? 'Run a practice exam and review high-yield topics today.' : `You have ${daysLeft} day(s) left. Prioritise weak topics first.`,
      kind: 'exam',
    });
  }

  if (streak >= 2) {
    reminders.push({
      id: 'streak',
      title: 'Keep the streak alive',
      detail: `You are on a ${streak}-day streak. Even a short review session keeps the momentum.`,
      kind: 'motivation',
    });
  }

  if (!online) {
    reminders.push({
      id: 'offline',
      title: 'Offline mode active',
      detail: 'You can keep studying offline. Progress will sync again once you reconnect.',
      kind: 'sync',
    });
  }

  return reminders;
}

export function getLeaderboard(socialState, studyLog, userProfile) {
  const contributions = {};

  socialState.groups.forEach((group) => {
    group.members.forEach((member) => {
      if (!contributions[member]) {
        contributions[member] = { name: member, points: 0, shared: 0, reviews: 0, sessions: 0 };
      }
    });

    group.resources.forEach((resource) => {
      if (!contributions[resource.author]) contributions[resource.author] = { name: resource.author, points: 0, shared: 0, reviews: 0, sessions: 0 };
      contributions[resource.author].shared += 1;
      contributions[resource.author].points += 20;
      resource.reviews.forEach((review) => {
        if (!contributions[review.author]) contributions[review.author] = { name: review.author, points: 0, shared: 0, reviews: 0, sessions: 0 };
        contributions[review.author].reviews += 1;
        contributions[review.author].points += 10;
      });
    });

    group.sessions.forEach((session) => {
      session.members.forEach((member) => {
        if (!contributions[member]) contributions[member] = { name: member, points: 0, shared: 0, reviews: 0, sessions: 0 };
        contributions[member].sessions += 1;
        contributions[member].points += 15;
      });
    });
  });

  const weeklyMinutes = studyLog
    .filter((entry) => new Date(entry.date) >= subDays(new Date(), 7))
    .reduce((sum, entry) => sum + (entry.minutesSpent || 0), 0);

  if (!contributions[userProfile.name]) {
    contributions[userProfile.name] = { name: userProfile.name, points: 0, shared: 0, reviews: 0, sessions: 0 };
  }
  contributions[userProfile.name].points += Math.round(weeklyMinutes / 10);

  return Object.values(contributions)
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}
