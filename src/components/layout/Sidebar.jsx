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
    <aside className={`${mobile ? 'h-full w-full max-w-72' : 'hidden h-screen md:sticky md:top-0 md:block md:w-72'} border-r border-white/10 bg-slate-900/80 backdrop-blur-md`}>
      <div className="px-4 py-5">
        <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-extrabold text-transparent">Exam Sprint Planner</h1>
        <p className="mt-2 text-xs text-muted">Adaptive planning, revision, and AI-assisted study.</p>
      </div>
      <nav className="space-y-1 px-2 pb-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-elem px-3 py-3 text-sm font-medium ${
                isActive
                  ? 'border-l-4 border-primary bg-primary/20 text-text'
                  : 'border-l-4 border-transparent text-muted hover:bg-slate-700/40 hover:text-text'
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
