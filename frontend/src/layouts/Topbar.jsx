import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Top application bar with breadcrumb, search, notifications, and user profile.
 */
export default function Topbar({ onMenuToggle, breadcrumbs = [], searchPlaceholder }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .map(p => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AU';

  const roleLabel = user?.role === 'admin'
    ? 'Head Academic Registrar'
    : user?.rollNumber
    ? `Student (${user.rollNumber})`
    : 'Student Account';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#c3c6d7] shadow-sm flex items-center justify-between px-4 md:px-6">
      {/* Left: hamburger + breadcrumb + search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 text-[#434655] hover:bg-[#e5eeff] rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Icon name="menu" size={24} />
        </button>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="hidden sm:flex items-center gap-1.5 text-label-sm text-[#434655]">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <Icon name="chevron_right" size={16} className="text-[#737686]" />}
                {crumb.to ? (
                  <button
                    onClick={() => navigate(crumb.to)}
                    className="hover:text-[#004ac6] hover:underline transition-colors"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-[#004ac6] font-semibold">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Search bar */}
        {searchPlaceholder && (
          <div className="relative hidden sm:block max-w-[280px] ml-2">
            <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d556b]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="h-9 pl-9 pr-4 rounded-xl border border-[#c3c6d7] text-body-sm text-[#0b1c30] placeholder:text-[#737686] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all w-64"
              style={{ backgroundColor: '#eff4ff' }}
            />
          </div>
        )}
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        {/* Notifications */}
        <button className="relative p-2 text-[#434655] hover:bg-[#e5eeff] rounded-full transition-colors" title="Notifications">
          <Icon name="notifications" size={22} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ backgroundColor: '#ba1a1a' }} />
        </button>

        <div className="w-px h-6 bg-[#c3c6d7]" />

        {/* User profile dropdown container */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2 pl-1 rounded-xl p-1 hover:bg-[#f8f9ff] transition-colors"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-label-sm font-bold text-[#004ac6]"
              style={{ backgroundColor: '#dbe1ff', border: '1px solid #c3c6d7' }}>
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-label-md font-semibold text-[#0b1c30] leading-tight">
                {user?.fullName || 'Academic User'}
              </span>
              <span className="text-label-xs text-[#434655]">{roleLabel}</span>
            </div>
            <Icon name="expand_more" size={18} className="text-[#4d556b] ml-0.5" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#c3c6d7] rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-[#e5eeff]">
                <p className="text-label-md font-semibold text-[#0b1c30] truncate">{user?.fullName}</p>
                <p className="text-label-xs text-[#737686] truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#eff4ff] text-[#004ac6]">
                  Role: {user?.role || 'student'}
                </span>
              </div>
              {user?.studentProfile && (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(`/students/${user.studentProfile}`);
                  }}
                  className="w-full text-left px-4 py-2 text-label-sm text-[#0b1c30] hover:bg-[#f8f9ff] flex items-center gap-2"
                >
                  <Icon name="person" size={16} />
                  <span>My Student Profile</span>
                </button>
              )}
              <button
                onClick={async () => {
                  setProfileOpen(false);
                  await logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 text-label-sm text-[#ba1a1a] hover:bg-[#ffdad6]/40 flex items-center gap-2"
              >
                <Icon name="logout" size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
