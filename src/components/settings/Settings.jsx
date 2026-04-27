import { useRef, useState } from 'react';
import { sanitizeTextInput, validateImportedBackup } from '../../utils/security';
import { safeClear, safeGetJson, safeGetItem, safeSetItem, safeSetJson } from '../../utils/storage';

export default function SettingsPage({
  userProfile,
  setUserProfile,
  setStudyLog,
  syncMeta,
  isOnline,
  notificationPermission,
  enableNotifications,
}) {
  const [apiKey, setApiKey] = useState(safeGetItem('openai_api_key', '', 'settings:api-key:init'));
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileRef = useRef(null);

  const showStatus = (type, message) => {
    setStatus({ type, message });
  };

  const saveApiKey = () => {
    const value = apiKey.trim();
    const saved = safeSetItem('openai_api_key', value, 'settings:api-key:save');
    showStatus(saved ? 'success' : 'error', saved ? (value ? 'API key saved.' : 'API key cleared.') : 'Could not save API key. Check browser storage settings.');
  };

  const clearAll = () => {
    const cleared = safeClear('settings:clear-all');
    if (!cleared) {
      showStatus('error', 'Could not clear local storage.');
      return;
    }
    setStudyLog([]);
    window.location.reload();
  };

  const exportData = () => {
    const data = {
      userProfile: safeGetJson('userProfile', {}, 'settings:export:user-profile'),
      exams: safeGetJson('exams', [], 'settings:export:exams'),
      studyLog: safeGetJson('studyLog', [], 'settings:export:study-log'),
      chatHistory: safeGetJson('chatHistory', [], 'settings:export:chat-history'),
      sprintPlans: safeGetJson('sprint_plans', {}, 'settings:export:sprint-plans'),
      socialStudyHub: safeGetJson('socialStudyHub', {}, 'settings:export:social'),
      cloudSnapshot: safeGetJson('exam_sprint_cloud_snapshot', {}, 'settings:export:cloud-snapshot'),
      syncMeta: safeGetJson('exam_sprint_sync_meta', {}, 'settings:export:sync-meta'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exam-sprint-planner-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showStatus('success', 'Backup exported as JSON.');
  };

  const importData = async (file) => {
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (!validateImportedBackup(data)) {
        throw new Error('Invalid backup structure');
      }
      const writes = [];
      if (data.userProfile) writes.push(safeSetJson('userProfile', data.userProfile, 'settings:import:user-profile'));
      if (data.exams) writes.push(safeSetJson('exams', data.exams, 'settings:import:exams'));
      if (data.studyLog) writes.push(safeSetJson('studyLog', data.studyLog, 'settings:import:study-log'));
      if (data.chatHistory) writes.push(safeSetJson('chatHistory', data.chatHistory, 'settings:import:chat-history'));
      if (data.sprintPlans) writes.push(safeSetJson('sprint_plans', data.sprintPlans, 'settings:import:sprint-plans'));
      if (data.socialStudyHub) writes.push(safeSetJson('socialStudyHub', data.socialStudyHub, 'settings:import:social'));
      if (data.cloudSnapshot) writes.push(safeSetJson('exam_sprint_cloud_snapshot', data.cloudSnapshot, 'settings:import:cloud-snapshot'));
      if (data.syncMeta) writes.push(safeSetJson('exam_sprint_sync_meta', data.syncMeta, 'settings:import:sync-meta'));
      if (writes.some((ok) => !ok)) {
        showStatus('error', 'Import partially failed due to browser storage limits.');
        return;
      }
      showStatus('success', 'Backup imported. Reloading...');
      window.location.reload();
    } catch {
      showStatus('error', 'Invalid JSON backup file. Please choose a valid planner backup.');
    }
  };

  return (
    <section className="space-y-4">
      <div className="glass-card p-4">
        <h2 className="text-2xl font-bold">Settings</h2>
        {status.message && (
          <p className={`mt-2 text-sm ${status.type === 'error' ? 'text-danger' : 'text-success'}`}>{status.message}</p>
        )}
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
