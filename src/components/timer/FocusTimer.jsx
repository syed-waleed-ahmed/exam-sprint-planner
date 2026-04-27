import { useEffect, useMemo, useRef, useState } from 'react';
import PomodoroRing from './PomodoroRing';

const TOTAL = 25 * 60;

export default function FocusTimer({ topic, onClose, onStatusUpdate, onLog, setActiveTopic, navigate }) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const onLogRef = useRef(onLog);
  const endAtRef = useRef(null);
  const loggedCompletionRef = useRef(false);

  useEffect(() => {
    onLogRef.current = onLog;
  }, [onLog]);

  useEffect(() => {
    setSecondsLeft(TOTAL);
    setRunning(false);
    setDone(false);
    endAtRef.current = null;
    loggedCompletionRef.current = false;
  }, [topic?.id]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const endAt = endAtRef.current;
      if (!endAt) return;
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining > 0) return;

      setRunning(false);
      setDone(true);
      endAtRef.current = null;
      if (!loggedCompletionRef.current) {
        loggedCompletionRef.current = true;
        onLogRef.current(25, 'pomodoro');
        const beep = new Audio('data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQAAAAA=');
        beep.play().catch(() => {});
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const startTimer = () => {
    if (secondsLeft <= 0) {
      setSecondsLeft(TOTAL);
      setDone(false);
      loggedCompletionRef.current = false;
      endAtRef.current = Date.now() + TOTAL * 1000;
      setRunning(true);
      return;
    }
    endAtRef.current = Date.now() + secondsLeft * 1000;
    setRunning(true);
  };

  const pauseTimer = () => {
    const endAt = endAtRef.current;
    if (endAt) {
      setSecondsLeft(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    }
    endAtRef.current = null;
    setRunning(false);
  };

  const resetTimer = () => {
    endAtRef.current = null;
    loggedCompletionRef.current = false;
    setSecondsLeft(TOTAL);
    setRunning(false);
    setDone(false);
  };

  const skipTimer = () => {
    endAtRef.current = null;
    setRunning(false);
    setDone(true);
  };

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
          <button className="btn-ghost px-3 py-1 text-sm" onClick={onClose}>Close</button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <PomodoroRing secondsLeft={secondsLeft} totalSeconds={TOTAL} />
          <div className="flex gap-2">
            <button className="btn-primary" onClick={running ? pauseTimer : startTimer}>{running ? 'Pause' : 'Start'}</button>
            <button className="btn-ghost" onClick={resetTimer}>Reset</button>
            <button className="btn-warning" onClick={skipTimer}>Skip</button>
          </div>

          <div className="w-full rounded-elem border border-white/10 bg-slate-800/40 p-3">
            <p className="mb-2 text-sm text-muted">Quick AI study modes</p>
            <div className="flex flex-wrap gap-2">
              {['Flashcards', 'Quiz', 'Chat'].map((mode) => (
                <button
                  key={mode}
                  className="btn-secondary rounded-full px-3 py-1 text-xs"
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
                    className="btn-ghost rounded-full px-3 py-1 text-xs"
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
