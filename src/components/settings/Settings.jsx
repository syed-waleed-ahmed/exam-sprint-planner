import { useRef, useState } from 'react';

export default function SettingsPage({ userProfile, setUserProfile, setStudyLog }) {
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
      if (data.userProfile) localStorage.setItem('userProfile', JSON.stringify(data.userProfile));
      if (data.exams) localStorage.setItem('exams', JSON.stringify(data.exams));
      if (data.studyLog) localStorage.setItem('studyLog', JSON.stringify(data.studyLog));
      if (data.chatHistory) localStorage.setItem('chatHistory', JSON.stringify(data.chatHistory));
      if (data.sprintPlans) localStorage.setItem('sprint_plans', JSON.stringify(data.sprintPlans));
      window.location.reload();
    } catch {
      alert('Invalid JSON file.');
    }
  };

  return (
    <section className="space-y-4">
      <div className="glass-card p-4">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <div className="glass-card space-y-4 p-4">
        <div>
          <label className="text-sm text-muted">User name</label>
          <input
            className="mt-1 w-full rounded-elem border border-white/10 bg-slate-800 px-3 py-2"
            value={userProfile.name}
            onChange={(e) => setUserProfile((prev) => ({ ...prev, name: e.target.value }))}
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
