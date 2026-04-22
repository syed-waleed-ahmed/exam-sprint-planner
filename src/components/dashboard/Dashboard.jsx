import { useMemo, useState } from 'react';
import { parseISO } from 'date-fns';
import { greeting, daysUntil } from '../../utils/dateHelpers';
import { calculateOverallReadiness, masteryCount } from '../../utils/readiness';
import { recommendTodaysTopics } from '../../utils/priorityEngine';
import {
  getAchievements,
  getEfficiencyFeedback,
  getLeaderboard,
  getPersonalizedRecommendations,
  getStudyStreak,
} from '../../utils/studyInsights';
import { sanitizeTextInput } from '../../utils/security';
import TodaysSprint from './TodaysSprint';
import ReadinessOverview from './ReadinessOverview';

function metric(title, value, hint) {
  return { title, value, hint };
}

const moods = [
  ['drained', 'Drained'],
  ['distracted', 'Distracted'],
  ['neutral', 'Neutral'],
  ['focused', 'Focused'],
  ['energised', 'Energised'],
];

export default function Dashboard({
  exams,
  userProfile,
  studyLog,
  markReviewed,
  onStudyTopic,
  setActiveTopic,
  logMood,
  social,
  reminders,
}) {
  const [groupForm, setGroupForm] = useState({ name: '', focusTopic: '', nextSessionAt: '' });
  const nearestExam = [...exams].sort((a, b) => parseISO(a.examDate) - parseISO(b.examDate))[0];
  const todayItems = recommendTodaysTopics(exams, 5);
  const recommendations = useMemo(
    () => getPersonalizedRecommendations(exams, studyLog, userProfile),
    [exams, studyLog, userProfile]
  );
  const efficiency = useMemo(
    () => getEfficiencyFeedback(studyLog, userProfile.dailyGoalMinutes),
    [studyLog, userProfile.dailyGoalMinutes]
  );
  const achievements = useMemo(() => getAchievements(exams, studyLog), [exams, studyLog]);
  const leaderboard = useMemo(
    () => getLeaderboard(social.socialState, studyLog, userProfile),
    [social.socialState, studyLog, userProfile]
  );

  const metrics = [
    metric('Total exams tracked', exams.length, 'Across all subjects'),
    metric('Overall readiness', `${calculateOverallReadiness(exams)}%`, 'Weighted by topic status'),
    metric('Topics mastered', masteryCount(exams), 'Status: confident'),
    metric('Current study streak', `${getStudyStreak(studyLog)} days`, 'Daily consistency'),
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

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Personalized Study Recommendations</h3>
              <p className="text-sm text-muted">AI-guided priorities based on progress, spacing, and exam urgency.</p>
            </div>
            <p className="rounded-full bg-secondary/15 px-3 py-1 text-xs text-secondary">{efficiency.completion}% goal completion</p>
          </div>
          <div className="mt-4 space-y-3">
            {recommendations.map((item) => (
              <article key={item.topicId} className="rounded-elem border border-white/10 bg-slate-900/35 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-semibold">{item.topicName}</h4>
                    <p className="text-xs text-muted">{item.examName} · {item.subject}</p>
                  </div>
                  <button
                    className="rounded-elem bg-primary px-3 py-1 text-xs font-semibold"
                    onClick={() => {
                      const match = exams
                        .flatMap((exam) =>
                          exam.topics.map((topic) => ({
                            ...topic,
                            examId: exam.id,
                            examName: exam.name,
                            examDate: exam.examDate,
                            subject: exam.subject,
                          }))
                        )
                        .find((topic) => topic.id === item.topicId);
                      if (match) {
                        setActiveTopic(match);
                        onStudyTopic(match);
                      }
                    }}
                  >
                    Start study
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-200">{item.reason}</p>
                <p className="mt-1 text-xs text-muted">Suggested block: {item.estimatedMinutes} minutes</p>
              </article>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-lg font-bold">Study Efficiency & Reminders</h3>
          <p className="text-sm text-muted">Keep your plan adaptive and realistic.</p>
          <div className="mt-4 rounded-elem border border-white/10 bg-slate-900/35 p-3">
            <p className="text-sm text-muted">Average session length</p>
            <p className="mt-1 text-2xl font-bold">{efficiency.avgSession} min</p>
            <p className="mt-2 text-xs text-muted">{efficiency.suggestions[0]}</p>
          </div>
          <div className="mt-4 space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="rounded-elem border border-white/10 bg-slate-900/30 p-3">
                <p className="font-semibold">{reminder.title}</p>
                <p className="mt-1 text-sm text-muted">{reminder.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted">Mood check-in</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {moods.map(([value, label]) => (
                <button
                  key={value}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs hover:border-secondary hover:text-secondary"
                  onClick={() => logMood(value, `${label} check-in from dashboard`)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
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

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr_0.9fr]">
        <div className="glass-card p-5">
          <h3 className="text-lg font-bold">Achievement Badges</h3>
          <div className="mt-4 space-y-3">
            {achievements.map((badge) => (
              <article key={badge.id} className={`rounded-elem border p-3 ${badge.unlocked ? 'border-success/40 bg-success/10' : 'border-white/10 bg-slate-900/30'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{badge.label}</p>
                    <p className="text-xs text-muted">{badge.detail}</p>
                  </div>
                  <span className="text-xs text-muted">{badge.progress}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold">Group Study Hub</h3>
              <p className="text-sm text-muted">Create shared sessions, keep challenges visible, and exchange study resources.</p>
            </div>
            <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">
              {social.groupsForUser.length} joined
            </span>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-12">
            <input
              className="input-base xl:col-span-4"
              placeholder="Study group name"
              value={groupForm.name}
              onChange={(e) => setGroupForm((prev) => ({ ...prev, name: sanitizeTextInput(e.target.value, 60) }))}
            />
            <input
              className="input-base xl:col-span-4"
              placeholder="Focus topic"
              value={groupForm.focusTopic}
              onChange={(e) => setGroupForm((prev) => ({ ...prev, focusTopic: sanitizeTextInput(e.target.value, 80) }))}
            />
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] xl:col-span-4">
              <input
                className="input-base w-full min-w-0"
                type="datetime-local"
                value={groupForm.nextSessionAt}
                onChange={(e) => setGroupForm((prev) => ({ ...prev, nextSessionAt: e.target.value }))}
              />
              <button
                className="btn-primary"
                onClick={() => {
                  social.createGroup(groupForm);
                  setGroupForm({ name: '', focusTopic: '', nextSessionAt: '' });
                }}
                disabled={!groupForm.name.trim()}
              >
                Create
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {social.socialState.groups.length === 0 ? (
              <p className="text-sm text-muted">No study groups yet. Create one to start sharing flashcards, quizzes, and notes.</p>
            ) : (
              social.socialState.groups.map((group) => (
                <article key={group.id} className="rounded-elem border border-white/10 bg-slate-900/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="max-w-[18rem] truncate font-semibold">{group.name}</p>
                      <p className="text-xs text-muted">{group.focusTopic} · {group.members.length} members</p>
                    </div>
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                      {!group.members.includes(userProfile.name) && (
                        <button className="btn-ghost px-3 py-1 text-xs" onClick={() => social.joinGroup(group.id, userProfile.name)}>
                          Join
                        </button>
                      )}
                      <button
                        className="btn-secondary px-3 py-1 text-xs"
                        onClick={() =>
                          social.addGroupSession(group.id, {
                            title: `${group.focusTopic} sprint`,
                            when: group.nextSessionAt || new Date().toISOString(),
                            members: group.members,
                          })
                        }
                      >
                        Schedule sprint
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    <div className="rounded-elem bg-slate-800/60 p-2 text-xs text-muted">Next session: {group.nextSessionAt || 'Plan one now'}</div>
                    <div className="rounded-elem bg-slate-800/60 p-2 text-xs text-muted">Shared resources: {group.resources.length}</div>
                    <div className="rounded-elem bg-slate-800/60 p-2 text-xs text-muted">Peer reviews: {group.resources.reduce((sum, resource) => sum + resource.reviews.length, 0)}</div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-lg font-bold">Leaderboard & Challenges</h3>
          <div className="mt-4 space-y-3">
            {leaderboard.slice(0, 5).map((entry) => (
              <div key={entry.name} className="flex flex-wrap items-center justify-between gap-2 rounded-elem border border-white/10 bg-slate-900/30 p-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">#{entry.rank} {entry.name}</p>
                  <p className="text-xs text-muted">{entry.shared} shared · {entry.reviews} reviews · {entry.sessions} sessions</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-secondary">{entry.points} pts</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {social.socialState.challenges.map((challenge) => (
              <article key={challenge.id} className="rounded-elem border border-white/10 bg-slate-900/30 p-3">
                <p className="font-semibold">{challenge.title}</p>
                <p className="mt-1 text-xs text-muted">{challenge.description}</p>
                <p className="mt-2 text-xs text-secondary">Target: {challenge.target} {challenge.unit}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ReadinessOverview exams={exams} />
    </div>
  );
}
