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
    <aside className={`${mobile ? 'w-full' : 'hidden md:block md:w-64'} h-full border-r border-white/10 bg-slate-900/70 backdrop-blur-md`}>
      <div className="px-4 py-5">
        <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-extrabold text-transparent">Exam Sprint Planner</h1>
      </div>
      <nav className="space-y-1 px-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-elem px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'border-l-4 border-primary bg-primary/20 text-text'
                  : 'border-l-4 border-transparent text-muted hover:bg-slate-700/40 hover:text-text'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className={`${mobile ? 'hidden' : 'hidden lg:inline'}`}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
