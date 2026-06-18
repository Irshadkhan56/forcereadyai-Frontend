import { Link, useLocation } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import { 
  FaTachometerAlt, 
  FaBuilding, 
  FaComments, 
  FaRunning, 
  FaHeartbeat, 
  FaUserAlt,
  FaChevronRight,
  FaLightbulb
} from 'react-icons/fa';
import { FaShieldHalved } from 'react-icons/fa6';
import logoImg from '../assets/logo.png';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { selectedDepartment } = useSelection();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: FaTachometerAlt,
    },
    {
      name: 'Departments',
      path: '/departments',
      icon: FaBuilding,
    },
  ];

  // If a department is selected, dynamically add links for the department's prep content
  if (selectedDepartment?.slug) {
    const slug = selectedDepartment.slug;
    navItems.push(
      {
        name: `${selectedDepartment.name} Hub`,
        path: `/department/${slug}`,
        icon: FaShieldHalved,
        exact: true,
      },
      {
        name: 'Interview Practice',
        path: `/department/${slug}/interview`,
        icon: FaComments,
      },
      {
        name: 'Physical Preparation',
        path: `/department/${slug}/physical`,
        icon: FaRunning,
      },
      {
        name: 'Medical Checklist',
        path: `/department/${slug}/medical`,
        icon: FaHeartbeat,
      }
    );
  }

  // Always append Profile
  navItems.push({
    name: 'Profile',
    path: '/profile',
    icon: FaUserAlt,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Brand logo header */}
      <Link to="/dashboard" className="flex items-center mb-8 px-2" onClick={onClose}>
        <img src={logoImg} alt="ForceReady.AI Logo" className="h-10 w-auto hover:opacity-90 transition-all" />
      </Link>

      {/* Navigation menu */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/departments' && location.pathname.startsWith(item.path));
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
              {isActive && <FaChevronRight className="w-3.5 h-3.5 text-primary-500" />}
            </Link>
          );
        })}
      </nav>

      {/* External Intelligence Prep Link at the bottom of the Sidebar */}
      <div className="mt-auto pt-6 border-t border-gray-850">
        <a
          href="https://smart-prep-ai-jet.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-2 p-3.5 bg-primary-600/10 border border-primary-500/15 rounded-xl hover:border-primary-500/35 transition-all text-left group"
        >
          <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-wider text-primary-400">
            <FaLightbulb className="w-4 h-4 animate-pulse" /> Intelligence Prep
          </div>
          <span className="text-white text-xs font-bold leading-normal">Practice Intelligence Tests</span>
          <span className="text-[10px] text-gray-500 leading-normal">Access Verbal, Non-Verbal, & Academic practice tests.</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
