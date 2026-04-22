import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { daysUntil } from '../../utils/dateHelpers';
import { confidenceDistribution } from '../../utils/readiness';
import VelocityScore from './VelocityScore';

const colors = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export default function StatsPage({ exams, studyLog }) {
  const activity14 = useMemo(() => {
    const map = {};
    for (let i = 13; i >= 0; i -= 1) {
      const key = format(subDays(new Date(), i), 'MM-dd');
      map[key] = 0;
    }
    studyLog.forEach((item) => {
      const key = format(new Date(item.date), 'MM-dd');
      if (key in map) map[key] += 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [studyLog]);

  const readinessOverTime = useMemo(() => {
    return exams.map((exam) => ({ exam: exam.name, readiness: exam.readiness, subject: exam.subject }));
  }, [exams]);

  const confidenceByExam = useMemo(
    () => exams.map((exam) => ({ exam: exam.name, ...confidenceDistribution(exam) })),
    [exams]
  );

  const subjectBreakdown = useMemo(() => {
    const topicByExam = Object.fromEntries(exams.flatMap((exam) => exam.topics.map((t) => [t.id, exam.subject])));
    const totals = {};
    studyLog.forEach((item) => {
      const subject = topicByExam[item.topicId] || 'Other';
      totals[subject] = (totals[subject] || 0) + (item.minutesSpent || 0);
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [studyLog, exams]);

  const topicsThisWeek = studyLog.filter((l) => {
    const d = new Date(l.date);
    const weekStart = subDays(new Date(), 7);
    return d >= weekStart;
  }).length;

  const topicsLastWeek = studyLog.filter((l) => {
    const d = new Date(l.date);
    const start = subDays(new Date(), 14);
    const end = subDays(new Date(), 7);
    return d >= start && d < end;
  }).length;

  const totalNotConfident = exams.reduce((sum, e) => sum + e.topics.filter((t) => t.status !== 'confident').length, 0) || 1;
  const advancedThisWeek = studyLog.filter((l) => l.sessionType?.includes('quiz') || l.sessionType === 'pomodoro').length;
  const avgDaysRemaining = exams.length ? exams.reduce((sum, exam) => sum + Math.max(daysUntil(exam.examDate), 1), 0) / exams.length : 1;
  const velocityScore = (advancedThisWeek / totalNotConfident) * (avgDaysRemaining / 7);

  return (
    <section className="space-y-4">
      <header className="grid gap-3 md:grid-cols-3">
        <div className="glass-card p-4">
          <p className="text-sm text-muted">Study velocity</p>
          <p className="mt-1 text-xl font-bold">{topicsThisWeek} vs {topicsLastWeek}</p>
          <p className="text-xs text-muted">{topicsThisWeek >= topicsLastWeek ? 'Upward trend' : 'Downward trend'}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted">Predicted readiness</p>
          <div className="mt-2 space-y-1 text-xs">
            {exams.map((exam) => (
              <p key={exam.id}>{exam.name}: {exam.readiness > 75 ? 'Yes' : exam.readiness > 45 ? 'At Risk' : 'No'}</p>
            ))}
          </div>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted">Total study time this week</p>
          <p className="mt-1 text-2xl font-bold">{studyLog.filter((l) => new Date(l.date) >= subDays(new Date(), 7)).reduce((s, l) => s + (l.minutesSpent || 0), 0)} min</p>
        </div>
      </header>

      <VelocityScore score={velocityScore} />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="glass-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Daily activity (14d)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity14}><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#7C3AED" /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Readiness over time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readinessOverTime}><XAxis dataKey="exam" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="readiness" stroke="#06B6D4" strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Confidence distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceByExam}><XAxis dataKey="exam" /><YAxis /><Tooltip /><Legend /><Bar dataKey="not_started" stackId="a" fill="#64748B" /><Bar dataKey="in_progress" stackId="a" fill="#F59E0B" /><Bar dataKey="revised" stackId="a" fill="#06B6D4" /><Bar dataKey="confident" stackId="a" fill="#10B981" /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Subject time breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subjectBreakdown} dataKey="value" nameKey="name" outerRadius={95} label>
                  {subjectBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
