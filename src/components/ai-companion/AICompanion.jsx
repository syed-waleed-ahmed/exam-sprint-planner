import { useMemo, useState } from 'react';
import ConfidencePill from '../shared/ConfidencePill';
import DaysRemaining from '../shared/DaysRemaining';
import TopicSelector from './TopicSelector';
import ChatTab from './ChatTab';
import FlashcardTab from './FlashcardTab';
import QuizTab from './QuizTab';
import MindmapTab from './MindmapTab';
import ExplainTab from './ExplainTab';
import { safeGetItem } from '../../utils/storage';

const tabs = ['Chat', 'Flashcards', 'Quiz', 'Mindmap', 'Explain'];

export default function AICompanion({
  exams,
  activeTopic,
  setActiveTopic,
  setTopicStatus,
  setTopicAiContent,
  addCustomDefinition,
  logTopicPerformance,
  chat,
  logSession,
  studyLog,
  userProfile,
  social,
}) {
  const [tab, setTab] = useState('Chat');
  const [query, setQuery] = useState('');

  const missingKey = !safeGetItem('openai_api_key', '', 'ai-companion:api-key');

  const topic = useMemo(() => {
    if (activeTopic) return activeTopic;
    const firstExam = exams[0];
    const firstTopic = firstExam?.topics?.[0];
    return firstTopic
      ? { ...firstTopic, examId: firstExam.id, examName: firstExam.name, subject: firstExam.subject, examDate: firstExam.examDate }
      : null;
  }, [activeTopic, exams]);

  if (!topic) {
    return <div className="glass-card p-8 text-center text-muted">Add at least one topic in My Exams to start the AI companion.</div>;
  }

  const saveAiContent = (key, value) => {
    setTopicAiContent(topic.examId, topic.id, key, value);
    setActiveTopic((prev) => (prev ? { ...prev, aiContent: { ...(prev.aiContent || {}), [key]: value } } : prev));
  };

  const handleStatus = (status) => {
    setTopicStatus(topic.examId, topic.id, status);
    setActiveTopic((prev) => ({ ...prev, status }));
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      <TopicSelector exams={exams} activeTopic={topic} onSelect={setActiveTopic} query={query} onQuery={setQuery} />

      <div className="glass-card p-4">
        <header className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">{topic.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-primary/20 px-2 py-1 text-primary">{topic.examName}</span>
              <span className="rounded-full bg-secondary/20 px-2 py-1 text-secondary">{topic.subject}</span>
              <DaysRemaining examDate={topic.examDate} />
            </div>
          </div>
          <ConfidencePill status={topic.status} onClick={() => {
            const next = topic.status === 'not_started' ? 'in_progress' : topic.status === 'in_progress' ? 'revised' : topic.status === 'revised' ? 'confident' : 'not_started';
            handleStatus(next);
          }} />
        </header>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button key={t} className={`shrink-0 rounded-full px-3 py-1 text-sm ${tab === t ? 'bg-primary text-white' : 'bg-slate-700/60 text-muted'}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Chat' && <ChatTab topic={topic} chat={chat} missingKey={missingKey} />}
        {tab === 'Flashcards' && (
          <FlashcardTab
            topic={topic}
            onSave={saveAiContent}
            social={social}
            userProfile={userProfile}
            addCustomDefinition={(definition) => addCustomDefinition(topic.examId, topic.id, definition)}
            missingKey={missingKey}
          />
        )}
        {tab === 'Quiz' && (
          <QuizTab
            topic={topic}
            onSave={saveAiContent}
            onLogPerformance={(kind, score) => logTopicPerformance(topic.examId, topic.id, kind, score)}
            onUpdateStatusFromQuiz={handleStatus}
            onLogQuiz={(score) =>
              logSession({
                date: new Date().toISOString(),
                topicId: topic.id,
                examId: topic.examId,
                minutesSpent: 15,
                sessionType: `quiz-${score}/5`,
              })
            }
            missingKey={missingKey}
          />
        )}
        {tab === 'Mindmap' && <MindmapTab topic={topic} onSave={saveAiContent} setActiveTab={setTab} missingKey={missingKey} />}
        {tab === 'Explain' && (
          <ExplainTab
            topic={topic}
            onSave={saveAiContent}
            onSetStatus={handleStatus}
            addCustomDefinition={(definition) => addCustomDefinition(topic.examId, topic.id, definition)}
            studyLog={studyLog}
            userProfile={userProfile}
            missingKey={missingKey}
          />
        )}
      </div>
    </section>
  );
}
