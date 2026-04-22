import { useEffect, useMemo, useState } from 'react';
import PomodoroRing from './PomodoroRing';

const TOTAL = 25 * 60;

export default function FocusTimer({ topic, onClose, onStatusUpdate, onLog, setActiveTopic, navigate }) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setRunning(false);
          setDone(true);
          onLog(25, 'pomodoro');
          const beep = new Audio('data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQAAAAA=');
          beep.play().catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const confidenceButtons = useMemo(
    () => [
      ['not_started', 'Still Confused'],
      ['in_progress', 'Somewhat Clear'],
      ['revised', 'Mostly Clear'],
      ['confident', 'Very Confident'],
    ],
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">Focus Timer</h3>
            <p className="text-sm text-muted">{topic.name}</p>
          </div>
          <button className="rounded-elem border border-white/20 px-3 py-1 text-sm" onClick={onClose}>Close</button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <PomodoroRing secondsLeft={secondsLeft} totalSeconds={TOTAL} />
          <div className="flex gap-2">
            <button className="rounded-elem bg-primary px-3 py-2 text-sm" onClick={() => setRunning((v) => !v)}>{running ? 'Pause' : 'Start'}</button>
            <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={() => { setSecondsLeft(TOTAL); setRunning(false); setDone(false); }}>Reset</button>
            <button className="rounded-elem border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning" onClick={() => { setDone(true); setRunning(false); }}>Skip</button>
          </div>

          <div className="w-full rounded-elem border border-white/10 bg-slate-800/40 p-3">
            <p className="mb-2 text-sm text-muted">Quick AI study modes</p>
            <div className="flex flex-wrap gap-2">
              {['Flashcards', 'Quiz', 'Chat'].map((mode) => (
                <button
                  key={mode}
                  className="rounded-full border border-secondary/40 px-3 py-1 text-xs text-secondary"
                  onClick={() => {
                    setActiveTopic(topic);
                    navigate('/ai');
                    onClose();
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {done && (
            <div className="w-full rounded-elem border border-success/50 bg-success/10 p-3 text-center">
              <p className="text-sm">How confident do you feel now?</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {confidenceButtons.map(([status, label]) => (
                  <button
                    key={status}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs"
                    onClick={() => {
                      onStatusUpdate(status);
                      onClose();
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
