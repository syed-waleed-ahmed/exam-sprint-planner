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
import { useSocialStudy } from './hooks/useSocialStudy';
import { getSmartReminders } from './utils/studyInsights';
import { getStorageWarningEventName, safeGetItem, safeGetJson, safeSetItem, safeSetJson } from './utils/storage';

const defaultProfile = {
  name: 'Learner',
  dailyGoalMinutes: 90,
  preferredStudyWindow: '18:00 - 20:00',
  preferredStudyDays: 5,
  freeTimePreference: 'balanced',
  reminderMode: 'smart',
  breakPreference: 10,
  preferredExplanationLevel: 'exam-ready',
  syncEnabled: true,
  notificationsEnabled: false,
  hFarmModuleEnabled: true,
  hFarmApps: ['Calendar', 'Learning Hub', 'Attendance'],
};

const CLOUD_KEY = 'exam_sprint_cloud_snapshot';
const SYNC_KEY = 'exam_sprint_sync_meta';

export default function App() {
  const { exams, addExam, deleteExam, addTopic, updateTopic, markReviewed, deleteTopic, setTopicStatus, setTopicAiContent, addCustomDefinition, logTopicPerformance, sprintPlans, updateSprintPlan } = useExams();
  const { studyLog, logSession, logMood, setStudyLog } = useStudyLog();
  const chat = useChatHistory();

  const [userProfile, setUserProfile] = useState(() => ({
    ...defaultProfile,
    ...(safeGetJson('userProfile', {}, 'profile:init') || {}),
  }));

  const [navOpen, setNavOpen] = useState(false);
  const [addExamOpen, setAddExamOpen] = useState(false);
  const [timerTopic, setTimerTopic] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [isOnline, setIsOnline] = useState(() => window.navigator.onLine);
  const [syncMeta, setSyncMeta] = useState(() =>
    safeGetJson(SYNC_KEY, { lastSyncedAt: '', source: 'local', status: 'idle' }, 'sync-meta:init')
  );
  const [notificationPermission, setNotificationPermission] = useState(() => window.Notification?.permission || 'default');
  const [storageWarning, setStorageWarning] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const social = useSocialStudy(userProfile.name);

  useEffect(() => {
    safeSetJson('userProfile', userProfile, 'profile:save');
  }, [userProfile]);

  useEffect(() => {
    const eventName = getStorageWarningEventName();
    const onWarning = (event) => {
      const nextMessage = event?.detail?.message || 'A storage issue occurred. Some changes may not persist.';
      setStorageWarning(nextMessage);
      setTimeout(() => setStorageWarning(''), 5000);
    };
    window.addEventListener(eventName, onWarning);
    return () => window.removeEventListener(eventName, onWarning);
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const topicLookup = useMemo(() => {
    const map = {};
    exams.forEach((exam) => {
      exam.topics.forEach((topic) => {
        map[topic.id] = { ...topic, examId: exam.id, examName: exam.name, subject: exam.subject, examDate: exam.examDate };
      });
    });
    return map;
  }, [exams]);

  const reminders = useMemo(
    () => getSmartReminders(exams, studyLog, userProfile, isOnline),
    [exams, studyLog, userProfile, isOnline]
  );

  const syncPayload = useMemo(
    () => ({
      userProfile,
      exams,
      studyLog,
      chatHistory: chat.chatHistory,
      sprintPlans,
      socialStudyHub: social.socialState,
    }),
    [userProfile, exams, studyLog, chat.chatHistory, sprintPlans, social.socialState]
  );

  useEffect(() => {
    if (!userProfile.syncEnabled) return;

    const updatedAt = new Date().toISOString();
    safeSetJson(CLOUD_KEY, { ...syncPayload, updatedAt }, 'sync:cloud-snapshot');
    const nextMeta = {
      lastSyncedAt: updatedAt,
      source: isOnline ? 'cloud-ready local mirror' : 'offline queue',
      status: isOnline ? 'synced' : 'queued',
    };
    setSyncMeta(nextMeta);
    safeSetJson(SYNC_KEY, nextMeta, 'sync:meta');
  }, [syncPayload, userProfile.syncEnabled, isOnline]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === SYNC_KEY && event.newValue) {
        try {
          setSyncMeta(JSON.parse(event.newValue));
        } catch {
          // Ignore invalid sync payloads.
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!userProfile.notificationsEnabled || !window.Notification || notificationPermission !== 'granted') return;
    const today = new Date().toISOString().slice(0, 10);
    const lastShown = safeGetItem('exam_sprint_last_notification', '', 'notifications:last-shown');
    if (!reminders.length || lastShown === today) return;

    const topReminder = reminders[0];
    new window.Notification(topReminder.title, { body: topReminder.detail });
    safeSetItem('exam_sprint_last_notification', today, 'notifications:last-shown');
  }, [reminders, userProfile.notificationsEnabled, notificationPermission]);

  const enableNotifications = async () => {
    if (!window.Notification) return;
    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      setUserProfile((prev) => ({ ...prev, notificationsEnabled: true }));
    }
  };

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
    logMood,
    chat,
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
    activeTopic,
    setActiveTopic,
    openTimerForTopic: (topic) => setTimerTopic(topic),
    topicLookup,
    setStudyLog,
    social,
    reminders,
    isOnline,
    syncMeta,
    notificationPermission,
    enableNotifications,
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />
      {navOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setNavOpen(false)}>
          <div className="h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar mobile onNavigate={() => setNavOpen(false)} />
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <TopBar
          onToggleNav={() => setNavOpen((v) => !v)}
          onOpenAddExam={() => setAddExamOpen(true)}
          onOpenTimer={() => setTimerTopic(activeTopic)}
          activeTopicName={activeTopic?.name}
          isOnline={isOnline}
          syncMeta={syncMeta}
        />

        <div className="page-shell">
          {storageWarning && (
            <div className="mb-3 rounded-elem border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
              {storageWarning}
            </div>
          )}
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
