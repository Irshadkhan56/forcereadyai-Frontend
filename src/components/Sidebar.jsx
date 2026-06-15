import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  Activity,
  HeartPulse,
  Award,
  User,
  Shield,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Interview Practice',
      path: '/interviews',
      icon: MessageSquareText,
    },
    {
      name: 'Physical Preparation',
      path: '/progress/physical',
      icon: Activity,
    },
    {
      name: 'Medical Checklist',
      path: '/progress/medical',
      icon: HeartPulse,
    },
    {
      name: 'Progress',
      path: '/progress/readiness',
      icon: Award,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Brand logo header */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-primary-600/20 border border-primary-500/30 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-500" />
        </div>
        <Link to="/dashboard" className="font-extrabold text-xl tracking-tight text-white" onClick={onClose}>
          Force<span className="text-primary-500">Ready</span> AI
        </Link>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600/15 border border-primary-500/30 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : ''}`} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-primary-500" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
