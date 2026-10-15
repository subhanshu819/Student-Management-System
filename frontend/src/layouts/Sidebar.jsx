import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', adminOnly: false },
    ...(isAdmin
      ? [
          { to: '/students', label: 'Students', icon: 'school', adminOnly: true },
          { to: '/students/new', label: 'Add Student', icon: 'person_add', adminOnly: true },
        ]
      : user?.studentProfile
      ? [{ to: `/students/${user.studentProfile}`, label: 'My Student Profile', icon: 'person', adminOnly: false }]
      : []),
  ];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ backgroundColor: 'rgba(11,28,48,0.4)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 z-30
          flex flex-col bg-white border-r border-[#c3c6d7] shadow-sm
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-1 pb-4 mb-4 border-b border-[#c3c6d7]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: '#004ac6' }}>
              <Icon name="school" size={22} filled className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-title-md text-[#0b1c30] leading-tight">Apex University</span>
              <span className="text-label-sm text-[#4d556b]">
                {isAdmin ? 'Admin Portal' : 'Student Portal'}
              </span>
            </div>
            {/* Mobile close */}
            <button
              onClick={onClose}
              className="ml-auto p-1 rounded text-[#4d556b] hover:bg-[#e5eeff] md:hidden"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon
                  name={item.icon}
                  size={20}
                  filled={false}
                  className="flex-shrink-0"
                />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="flex flex-col gap-3 pt-4 border-t border-[#c3c6d7]">
            {/* Term indicator */}
            <div className="p-3 rounded-xl border border-[#c3c6d7]" style={{ backgroundColor: '#eff4ff' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-label-xs text-[#4d556b] uppercase tracking-wider font-bold">Current Term</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: '#006c49' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#006c49' }} />
                </span>
              </div>
              <span className="text-label-md font-semibold text-[#0b1c30] block">Odd Semester 2026–27</span>
              <span className="text-label-sm text-[#434655] block">Week 11 (Registrar Active)</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="nav-item text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
              style={{ color: '#ba1a1a' }}
            >
              <Icon name="logout" size={20} className="flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
