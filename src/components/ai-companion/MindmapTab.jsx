import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useAI } from '../../hooks/useAI';
import LoadingSkeleton from '../shared/LoadingSkeleton';

export default function MindmapTab({ topic, onSave, missingKey }) {
  const { requestJson } = useAI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeBranch, setActiveBranch] = useState(null);
  const canvasRef = useRef(null);

  const mindmap = topic.aiContent?.mindmap;

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const prompt = `Generate a mindmap for '${topic.name}' in ${topic.subject}. Return ONLY valid JSON: {"center": string, "branches": [{"label": string, "children": [string, string, string]}]} with 4-6 branches.`;
      const data = await requestJson(prompt);
      onSave('mindmap', data);
      setActiveBranch(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  const exportPng = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current, { backgroundColor: '#0F172A' });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.name.replace(/\s+/g, '_')}_mindmap.png`;
    a.click();
  };

  if (missingKey) return <div className="rounded-elem border border-warning/40 bg-warning/10 p-3 text-sm text-warning">Add your AI API key in Settings -&gt;</div>;

  if (loading) return <LoadingSkeleton lines={8} />;
  if (error) return <div className="rounded-elem border border-danger/50 bg-danger/10 p-3 text-sm text-danger">{error}</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="rounded-elem bg-secondary/20 px-3 py-2 text-sm font-semibold text-secondary" onClick={generate}>{mindmap ? 'Regenerate Mindmap' : 'Generate Mindmap'}</button>
        {mindmap && <button className="rounded-elem border border-white/20 px-3 py-2 text-sm" onClick={exportPng}>Export as PNG</button>}
      </div>
      {!mindmap ? (
        <p className="text-sm text-muted">No mindmap yet. Generate one to visualize concepts.</p>
      ) : (
        <div className="space-y-3">
          <div ref={canvasRef} className="overflow-x-auto rounded-card border border-white/10 bg-slate-900/40 p-4">
            <svg width="900" height="500" viewBox="0 0 900 500">
            <circle cx="450" cy="250" r="60" fill="#7C3AED" />
            <text x="450" y="255" textAnchor="middle" fill="#F8FAFC" fontSize="13" fontWeight="700">{mindmap.center}</text>
            {mindmap.branches.map((branch, idx) => {
              const angle = (idx / mindmap.branches.length) * Math.PI * 2;
              const bx = 450 + Math.cos(angle) * 180;
              const by = 250 + Math.sin(angle) * 160;
              const highlighted = activeBranch === null || activeBranch === idx;

              return (
                <g key={branch.label} onClick={() => setActiveBranch(idx)} style={{ cursor: 'pointer', opacity: highlighted ? 1 : 0.3 }}>
                  <path d={`M450,250 Q${(450 + bx) / 2},${(250 + by) / 2 - 20} ${bx},${by}`} stroke="#06B6D4" fill="none" strokeWidth="2" />
                  <circle cx={bx} cy={by} r="34" fill="#06B6D4" />
                  <text x={bx} y={by + 3} textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="700">{branch.label}</text>
                  {branch.children?.map((child, cidx) => {
                    const cAngle = angle + (cidx - 1) * 0.25;
                    const cx = bx + Math.cos(cAngle) * 120;
                    const cy = by + Math.sin(cAngle) * 90;
                    return (
                      <g key={`${branch.label}-${child}`}>
                        <path d={`M${bx},${by} Q${(bx + cx) / 2},${(by + cy) / 2} ${cx},${cy}`} stroke="#94A3B8" fill="none" strokeWidth="1.6" />
                        <rect x={cx - 52} y={cy - 12} rx="10" ry="10" width="104" height="24" fill="#334155" />
                        <text x={cx} y={cy + 4} textAnchor="middle" fill="#F8FAFC" fontSize="10">{child}</text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
            </svg>
          </div>
          <details className="rounded-elem border border-white/10 bg-slate-900/40 p-3">
            <summary className="cursor-pointer text-sm text-muted">Raw JSON output</summary>
            <pre className="mt-2 max-h-48 overflow-auto text-xs text-slate-300">{JSON.stringify(mindmap, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
