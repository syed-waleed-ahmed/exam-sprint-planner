import { BarChart3, BookOpen, CalendarDays, Home, Settings, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/exams', label: 'My Exams', icon: BookOpen },
  { to: '/planner', label: 'Sprint Planner', icon: CalendarDays },
  { to: '/ai', label: 'AI Study Companion', icon: Sparkles },
  { to: '/stats', label: 'Stats & Velocity', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ mobile = false, onNavigate }) {
  return (
    <aside
      className={`${
        mobile ? 'h-full w-full max-w-72' : 'hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-72 md:flex-col'
      } border-r border-white/10 bg-surface/75 backdrop-blur-xl overflow-y-auto`}
    >
      <div className="border-b border-white/10 px-4 py-5">
        <h1 className="text-xl font-bold tracking-tight text-text">Exam Sprint Planner</h1>
        <p className="mt-2 text-xs text-muted">Adaptive planning, revision, and AI-assisted study.</p>
      </div>
      <nav className="space-y-1 px-2 py-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-elem border px-3 py-3 text-sm font-medium ${
                isActive
                  ? 'border-primary/50 bg-primary/20 text-text shadow-sm'
                  : 'border-transparent text-muted hover:border-white/10 hover:bg-white/5 hover:text-text'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
