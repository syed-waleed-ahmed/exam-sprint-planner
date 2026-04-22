import { parseISO } from 'date-fns';
import { greeting, daysUntil } from '../../utils/dateHelpers';
import { calculateOverallReadiness, masteryCount } from '../../utils/readiness';
import { recommendTodaysTopics } from '../../utils/priorityEngine';
import TodaysSprint from './TodaysSprint';
import ReadinessOverview from './ReadinessOverview';

function metric(title, value, hint) {
  return { title, value, hint };
}

function studyStreak(studyLog) {
  const days = new Set(studyLog.map((x) => new Date(x.date).toISOString().slice(0, 10)));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toISOString().slice(0, 10))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function Dashboard({ exams, userProfile, studyLog, markReviewed, onStudyTopic, setActiveTopic }) {
  const nearestExam = [...exams].sort((a, b) => parseISO(a.examDate) - parseISO(b.examDate))[0];
  const todayItems = recommendTodaysTopics(exams, 5);

  const metrics = [
    metric('Total exams tracked', exams.length, 'Across all subjects'),
    metric('Overall readiness', `${calculateOverallReadiness(exams)}%`, 'Weighted by topic status'),
    metric('Topics mastered', masteryCount(exams), 'Status: confident'),
    metric('Current study streak', `${studyStreak(studyLog)} days`, 'Daily consistency'),
  ];

  return (
    <div className="space-y-6">
      <header className="glass-card p-5">
        <h2 className="text-2xl font-bold">Good {greeting()}, {userProfile.name}</h2>
        <p className="mt-1 text-sm text-muted">
          {nearestExam ? `${Math.max(daysUntil(nearestExam.examDate), 0)} days to ${nearestExam.name}` : 'Add your first exam to begin planning.'}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <article key={item.title} className="metric-card">
            <p className="text-sm text-muted">{item.title}</p>
            <p className="mt-2 text-2xl font-bold">{item.value}</p>
            <p className="mt-1 text-xs text-muted">{item.hint}</p>
          </article>
        ))}
      </section>

      <TodaysSprint
        items={todayItems}
        onStudyTopic={(item) => {
          const enriched = {
            ...item.topic,
            examId: item.examId,
            examName: item.examName,
            examDate: item.examDate,
            subject: exams.find((e) => e.id === item.examId)?.subject,
          };
          setActiveTopic(enriched);
          onStudyTopic(enriched);
        }}
        onMarkReviewed={markReviewed}
      />

      <ReadinessOverview exams={exams} />
    </div>
  );
}
