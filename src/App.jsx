import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './components/dashboard/Dashboard';
import ExamList from './components/exams/ExamList';
import SprintPlanner from './components/planner/SprintPlanner';
import AICompanion from './components/ai-companion/AICompanion';
import StatsPage from './components/stats/StatsPage';
import SettingsPage from './components/settings/Settings';
import FocusTimer from './components/timer/FocusTimer';
import AddExamModal from './components/exams/AddExamModal';
import { useExams } from './hooks/useExams';
import { useStudyLog } from './hooks/useStudyLog';
import { useChatHistory } from './hooks/useChatHistory';

const defaultProfile = { name: 'Learner', dailyGoalMinutes: 90 };

export default function App() {
  const { exams, addExam, deleteExam, addTopic, updateTopic, markReviewed, deleteTopic, setTopicStatus, setTopicAiContent, sprintPlans, updateSprintPlan } = useExams();
  const { studyLog, logSession, setStudyLog } = useStudyLog();
  const chat = useChatHistory();

  const [userProfile, setUserProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userProfile')) || defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [navOpen, setNavOpen] = useState(false);
  const [addExamOpen, setAddExamOpen] = useState(false);
  const [timerTopic, setTimerTopic] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  const topicLookup = useMemo(() => {
    const map = {};
    exams.forEach((exam) => {
      exam.topics.forEach((topic) => {
        map[topic.id] = { ...topic, examId: exam.id, examName: exam.name, subject: exam.subject, examDate: exam.examDate };
      });
    });
    return map;
  }, [exams]);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.key === 'A' || e.key === 'a') {
        setAddExamOpen(true);
      }
      if (e.key === 'T' || e.key === 't') {
        navigate('/');
        document.getElementById('todays-focus')?.scrollIntoView({ behavior: 'smooth' });
      }
      if (e.key === '/') {
        if (location.pathname !== '/ai') navigate('/ai');
        setTimeout(() => document.getElementById('topic-search')?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setAddExamOpen(false);
        setTimerTopic(null);
        setNavOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, location.pathname]);

  const ctx = {
    exams,
    userProfile,
    setUserProfile,
    studyLog,
    logSession,
    chat,
    addExam,
    deleteExam,
    addTopic,
    updateTopic,
    markReviewed,
    deleteTopic,
    setTopicStatus,
    setTopicAiContent,
    sprintPlans,
    updateSprintPlan,
    activeTopic,
    setActiveTopic,
    openTimerForTopic: (topic) => setTimerTopic(topic),
    topicLookup,
    setStudyLog,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {navOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setNavOpen(false)}>
          <div className="h-full w-64" onClick={(e) => e.stopPropagation()}>
            <Sidebar mobile onNavigate={() => setNavOpen(false)} />
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto">
        <TopBar
          onToggleNav={() => setNavOpen((v) => !v)}
          onOpenAddExam={() => setAddExamOpen(true)}
          onOpenTimer={() => setTimerTopic(activeTopic)}
          activeTopicName={activeTopic?.name}
        />

        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <Routes>
            <Route path="/" element={<Dashboard {...ctx} onStudyTopic={(topic) => { setActiveTopic(topic); navigate('/ai'); }} />} />
            <Route path="/exams" element={<ExamList {...ctx} onStudyTopic={(topic) => { setActiveTopic(topic); navigate('/ai'); }} />} />
            <Route path="/planner" element={<SprintPlanner {...ctx} />} />
            <Route path="/ai" element={<AICompanion {...ctx} />} />
            <Route path="/stats" element={<StatsPage {...ctx} />} />
            <Route path="/settings" element={<SettingsPage {...ctx} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {addExamOpen && <AddExamModal onClose={() => setAddExamOpen(false)} onSubmit={(payload) => { addExam(payload); setAddExamOpen(false); }} />}

      {timerTopic && (
        <FocusTimer
          topic={timerTopic}
          onClose={() => setTimerTopic(null)}
          onStatusUpdate={(status) => setTopicStatus(timerTopic.examId, timerTopic.id, status)}
          onLog={(minutesSpent, sessionType) =>
            logSession({
              date: new Date().toISOString(),
              topicId: timerTopic.id,
              examId: timerTopic.examId,
              minutesSpent,
              sessionType,
            })
          }
          setActiveTopic={setActiveTopic}
          navigate={navigate}
        />
      )}
    </div>
  );
}
