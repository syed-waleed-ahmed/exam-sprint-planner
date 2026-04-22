import { useRef, useState } from 'react';
import { sanitizeTextInput, validateImportedBackup } from '../../utils/security';

export default function SettingsPage({
  userProfile,
  setUserProfile,
  setStudyLog,
  syncMeta,
  isOnline,
  notificationPermission,
  enableNotifications,
}) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef(null);

  const saveApiKey = () => {
    const value = apiKey.trim();
    localStorage.setItem('openai_api_key', value);
  };

  const clearAll = () => {
    localStorage.clear();
    setStudyLog([]);
    window.location.reload();
  };

  const exportData = () => {
    const data = {
      userProfile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
      exams: JSON.parse(localStorage.getItem('exams') || '[]'),
      studyLog: JSON.parse(localStorage.getItem('studyLog') || '[]'),
      chatHistory: JSON.parse(localStorage.getItem('chatHistory') || '[]'),
      sprintPlans: JSON.parse(localStorage.getItem('sprint_plans') || '{}'),
      socialStudyHub: JSON.parse(localStorage.getItem('socialStudyHub') || '{}'),
      cloudSnapshot: JSON.parse(localStorage.getItem('exam_sprint_cloud_snapshot') || '{}'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exam-sprint-planner-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file) => {
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (!validateImportedBackup(data)) {
        throw new Error('Invalid backup structure');
      }
      if (data.userProfile) localStorage.setItem('userProfile', JSON.stringify(data.userProfile));
      if (data.exams) localStorage.setItem('exams', JSON.stringify(data.exams));
      if (data.studyLog) localStorage.setItem('studyLog', JSON.stringify(data.studyLog));
      if (data.chatHistory) localStorage.setItem('chatHistory', JSON.stringify(data.chatHistory));
      if (data.sprintPlans) localStorage.setItem('sprint_plans', JSON.stringify(data.sprintPlans));
      if (data.socialStudyHub) localStorage.setItem('socialStudyHub', JSON.stringify(data.socialStudyHub));
      if (data.cloudSnapshot) localStorage.setItem('exam_sprint_cloud_snapshot', JSON.stringify(data.cloudSnapshot));
      window.location.reload();
    } catch {
      alert('Invalid JSON backup file.');
    }
  };

  return (
    <section className="space-y-4">
      <div className="glass-card p-4">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="glass-card space-y-4 p-4">
          <div>
            <label className="text-sm text-muted">User name</label>
            <input
              className="mt-1 w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2"
              value={userProfile.name}
              onChange={(e) => setUserProfile((prev) => ({ ...prev, name: sanitizeTextInput(e.target.value, 80) }))}
            />
          </div>

          <div>
            <label className="text-sm text-muted">Daily study goal: {userProfile.dailyGoalMinutes} min</label>
            <input
              className="mt-1 w-full"
              type="range"
              min={30}
              max={240}
              step={15}
              value={userProfile.dailyGoalMinutes}
              onChange={(e) => setUserProfile((prev) => ({ ...prev, dailyGoalMinutes: Number(e.target.value) }))}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm text-muted">Preferred study window</label>
              <input
                className="mt-1 w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2"
                value={userProfile.preferredStudyWindow}
                onChange={(e) => setUserProfile((prev) => ({ ...prev, preferredStudyWindow: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted">Preferred study days</label>
              <input
                className="mt-1 w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2"
                type="number"
                min={3}
                max={7}
                value={userProfile.preferredStudyDays}
                onChange={(e) => setUserProfile((prev) => ({ ...prev, preferredStudyDays: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm text-muted">Free-time mode</label>
              <select
                className="mt-1 w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2"
                value={userProfile.freeTimePreference}
                onChange={(e) => setUserProfile((prev) => ({ ...prev, freeTimePreference: e.target.value }))}
              >
                <option value="light">Light</option>
                <option value="balanced">Balanced</option>
                <option value="intense">Intense</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted">Explanation depth</label>
              <select
                className="mt-1 w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2"
                value={userProfile.preferredExplanationLevel}
                onChange={(e) => setUserProfile((prev) => ({ ...prev, preferredExplanationLevel: e.target.value }))}
              >
                <option value="quick">Quick refresh</option>
                <option value="guided">Guided walkthrough</option>
                <option value="exam-ready">Exam ready</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted">OpenAI API key</label>
            <div className="mt-1 flex gap-2">
              <input
                className="w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
                placeholder="sk-..."
              />
              <button className="rounded-elem bg-primary px-3 py-2 text-sm" onClick={saveApiKey}>Save</button>
            </div>
          </div>
        </div>

        <div className="glass-card space-y-4 p-4">
          <div className="rounded-elem border border-white/10 bg-slate-900/30 p-3">
            <h3 className="font-semibold">Offline mode & cloud sync</h3>
            <p className="mt-1 text-sm text-muted">
              Status: {isOnline ? 'Online' : 'Offline'} · {syncMeta.status || 'idle'} · {syncMeta.lastSyncedAt || 'No sync yet'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={`rounded-elem px-3 py-2 text-sm ${userProfile.syncEnabled ? 'bg-success/20 text-success' : 'border border-white/20'}`}
                onClick={() => setUserProfile((prev) => ({ ...prev, syncEnabled: !prev.syncEnabled }))}
              >
                {userProfile.syncEnabled ? 'Cloud mirror enabled' : 'Enable cloud mirror'}
              </button>
              <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={exportData}>Export sync pack</button>
            </div>
            <p className="mt-2 text-xs text-muted">The planner stays usable offline and mirrors a sync snapshot locally for seamless recovery and multi-device transfer.</p>
          </div>

          <div className="rounded-elem border border-white/10 bg-slate-900/30 p-3">
            <h3 className="font-semibold">Notifications & reminders</h3>
            <p className="mt-1 text-sm text-muted">Permission: {notificationPermission}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-elem bg-primary px-3 py-2 text-sm" onClick={enableNotifications}>Enable browser notifications</button>
              <button
                className={`rounded-elem px-3 py-2 text-sm ${userProfile.notificationsEnabled ? 'bg-success/20 text-success' : 'border border-white/20'}`}
                onClick={() => setUserProfile((prev) => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))}
              >
                {userProfile.notificationsEnabled ? 'Smart reminders on' : 'Smart reminders off'}
              </button>
            </div>
          </div>

          <div className="rounded-elem border border-white/10 bg-slate-900/30 p-3">
            <h3 className="font-semibold">H-Farm integration</h3>
            <p className="mt-1 text-sm text-muted">Expose this planner as a module within the broader academic dashboard and keep app links aligned.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={`rounded-elem px-3 py-2 text-sm ${userProfile.hFarmModuleEnabled ? 'bg-secondary/20 text-secondary' : 'border border-white/20'}`}
                onClick={() => setUserProfile((prev) => ({ ...prev, hFarmModuleEnabled: !prev.hFarmModuleEnabled }))}
              >
                {userProfile.hFarmModuleEnabled ? 'Module enabled' : 'Enable module'}
              </button>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {['Calendar', 'Learning Hub', 'Attendance'].map((app) => {
                const active = userProfile.hFarmApps.includes(app);
                return (
                  <button
                    key={app}
                    className={`rounded-elem px-3 py-2 text-sm ${active ? 'bg-primary/15 text-primary' : 'border border-white/20'}`}
                    onClick={() =>
                      setUserProfile((prev) => ({
                        ...prev,
                        hFarmApps: active ? prev.hFarmApps.filter((item) => item !== app) : [...prev.hFarmApps, app],
                      }))
                    }
                  >
                    {app}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card flex flex-wrap gap-2 p-4">
        <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={exportData}>Export data as JSON</button>
        <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => fileRef.current?.click()}>Import data from JSON</button>
        <input ref={fileRef} type="file" className="hidden" accept="application/json" onChange={(e) => importData(e.target.files?.[0])} />
        <button className="rounded-elem bg-danger/20 px-3 py-2 text-sm text-danger" onClick={() => setConfirmClear(true)}>Clear all data</button>
      </div>

      {confirmClear && (
        <div className="glass-card p-4">
          <p className="text-sm">Are you sure you want to clear all data?</p>
          <div className="mt-3 flex gap-2">
            <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => setConfirmClear(false)}>Cancel</button>
            <button className="rounded-elem bg-danger px-3 py-2 text-sm" onClick={clearAll}>Yes, clear all</button>
          </div>
        </div>
      )}
    </section>
  );
}
