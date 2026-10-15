import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Topbar from '../layouts/Topbar.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getStudentStats, exportRoster } from '../services/studentService.js';
import { recentActivity, departmentStats as fallbackDeptStats } from '../data/mockData.js';

function StatCard({ label, value, subLabel, icon, trend, trendUp }) {
  return (
    <div className="card p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-label-sm text-[#434655]">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eff4ff' }}>
          <Icon name={icon} size={18} className="text-[#004ac6]" />
        </div>
      </div>
      <span className="text-headline-md text-[#0b1c30]" style={{ fontFeatureSettings: '"tnum"' }}>{value}</span>
      {trend && (
        <span className="text-label-sm flex items-center gap-1" style={{ color: trendUp ? '#006c49' : '#ba1a1a' }}>
          <Icon name={trendUp ? 'trending_up' : 'trending_down'} size={14} />
          {trend}
        </span>
      )}
      {subLabel && <span className="text-body-sm text-[#434655]">{subLabel}</span>}
    </div>
  );
}

function ActivityItem({ activity }) {
  const iconColors = {
    add: { bg: '#ECFDF5', color: '#006c49' },
    edit: { bg: '#eff4ff', color: '#004ac6' },
    warning: { bg: '#FFFBEB', color: '#92400E' },
    delete: { bg: '#FEF2F2', color: '#991B1B' },
    info: { bg: '#eff4ff', color: '#4d556b' },
  };
  const style = iconColors[activity.type] || iconColors.info;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#e5eeff] last:border-0">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: style.bg }}>
        <Icon name={activity.icon} size={16} style={{ color: style.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm text-[#0b1c30]">{activity.text}</p>
        <span className="text-label-xs text-[#737686]">{activity.time}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const ctx = useOutletContext();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data } = await getStudentStats();
        if (isMounted) {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Could not fetch aggregate stats from API, using fallback:', err.message);
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, [isAdmin]);

  const totalCount = stats?.totalStudents ?? 1248;
  const activeCount = stats?.activeStudents ?? 1184;
  const avgCgpa = stats?.averageCgpa ?? 8.42;
  const avgAttendance = stats?.averageAttendance ?? 88.6;

  const deptList = stats?.departments?.length > 0
    ? stats.departments.map(d => ({
        code: d.code.toUpperCase(),
        dept: d.label,
        count: d.count,
        color: '#2563eb',
      }))
    : fallbackDeptStats;

  const maxDeptCount = Math.max(...deptList.map(d => d.count), 1);

  return (
    <>
      <Topbar
        onMenuToggle={ctx?.onMenuToggle}
        breadcrumbs={[
          { label: 'Academics', to: '/dashboard' },
          { label: 'Dashboard' },
        ]}
      />

      <main className="flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto">
        {/* Welcome banner */}
        <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-headline-md text-[#0b1c30]">
                Welcome back, {user?.fullName || 'Academic Member'}!
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-xs font-bold text-[#006c49]"
                style={{ backgroundColor: '#ECFDF5', border: '1px solid #10B981' }}>
                <Icon name="verified" size={13} filled />
                {isAdmin ? 'Admin Verified' : 'Student Verified'}
              </span>
            </div>
            <p className="text-body-md text-[#434655]">
              Apex University Student Administration Portal — Academic Year 2026-27
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-label-sm px-3 py-1 rounded-full border border-[#c3c6d7]"
                style={{ backgroundColor: '#eff4ff' }}>
                Odd Semester 2026–27
              </span>
              <span className="text-label-sm px-3 py-1 rounded-full border border-[#c3c6d7]"
                style={{ backgroundColor: '#eff4ff' }}>
                Week 11 (Registrar Active)
              </span>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => exportRoster()}
              className="btn-secondary flex-shrink-0"
            >
              <Icon name="download" size={18} />
              Export Summary Report
            </button>
          )}
        </div>

        {/* Notice for Students */}
        {!isAdmin && (
          <div className="card p-5 border-l-4 border-[#004ac6] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e5eeff] text-[#004ac6]">
                <Icon name="account_circle" size={24} />
              </div>
              <div>
                <h2 className="text-title-md font-semibold text-[#0b1c30]">Personal Student Portal</h2>
                <p className="text-body-sm text-[#434655]">
                  You are logged in as an enrolled student. You can view and maintain your institutional profile and course registrations.
                </p>
              </div>
            </div>
            {user?.studentProfile && (
              <button
                onClick={() => navigate(`/students/${user.studentProfile}`)}
                className="btn-primary flex-shrink-0"
              >
                <Icon name="school" size={18} />
                View My Profile
              </button>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Enrolled Students"
            value={totalCount.toLocaleString()}
            icon="school"
            trend={stats ? 'Live database aggregate' : '+312 admissions this semester'}
            trendUp
          />
          <StatCard
            label="Active Students"
            value={activeCount.toLocaleString()}
            icon="person_check"
            subLabel={`${((activeCount / (totalCount || 1)) * 100).toFixed(1)}% of total`}
          />
          <StatCard
            label="Average CGPA"
            value={avgCgpa.toFixed(2)}
            icon="grade"
            subLabel="Out of 10.0"
            trend="↑ 0.12 from last semester"
            trendUp
          />
          <StatCard
            label="Avg. Attendance"
            value={`${avgAttendance}%`}
            icon="calendar_today"
            subLabel="Above 75% threshold"
            trend="Meets mandatory requirement"
            trendUp
          />
        </div>

        {/* Middle section: Activity + Departments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-headline-sm text-[#0b1c30]">Recent Activity</h2>
              <span className="text-label-xs text-[#737686] uppercase tracking-wider">Today</span>
            </div>
            {recentActivity.map(a => <ActivityItem key={a.id} activity={a} />)}
          </div>

          {/* Department breakdown */}
          <div className="card p-5">
            <h2 className="text-headline-sm text-[#0b1c30] mb-4">Enrollment by Department</h2>
            <div className="flex flex-col gap-3">
              {deptList.map(dept => (
                <div key={dept.code}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-label-md font-semibold text-[#0b1c30]">{dept.code}</span>
                      <span className="text-body-sm text-[#434655] ml-2">{dept.dept}</span>
                    </div>
                    <span className="text-data-tabular text-[#0b1c30] font-semibold"
                      style={{ fontFeatureSettings: '"tnum"' }}>
                      {dept.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#e5eeff' }}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: dept.color || '#2563eb',
                        width: `${(dept.count / maxDeptCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card p-5">
          <h2 className="text-headline-sm text-[#0b1c30] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ...(isAdmin
                ? [
                    { label: 'Add New Student', icon: 'person_add', to: '/students/new', primary: true },
                    { label: 'View All Students', icon: 'manage_accounts', to: '/students' },
                    { label: 'Export Roster', icon: 'file_download', onClick: () => exportRoster() },
                    { label: 'Academic Reports', icon: 'bar_chart', to: '/students' },
                  ]
                : [
                    ...(user?.studentProfile
                      ? [{ label: 'View My Record', icon: 'person', to: `/students/${user.studentProfile}`, primary: true }]
                      : []),
                    { label: 'Department Directory', icon: 'school', to: '#' },
                    { label: 'Campus Regulations', icon: 'description', to: '#' },
                    { label: 'Registrar Helpdesk', icon: 'help_outline', to: '#' },
                  ]),
            ].map(action => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  if (action.onClick) action.onClick();
                  else if (action.to) navigate(action.to);
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer text-left
                  ${action.primary
                    ? 'text-white border-transparent hover:opacity-90'
                    : 'border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#eff4ff] text-[#0b1c30]'
                  }`}
                style={action.primary ? { backgroundColor: '#2563eb' } : { backgroundColor: '#fff' }}
              >
                <Icon name={action.icon} size={22} className={action.primary ? 'text-white' : 'text-[#004ac6]'} />
                <span className="text-label-sm text-center font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-[#c3c6d7] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-label-xs text-[#737686]">
          <span>Apex University Student Information System (ApexSIRS v4.8) · Registrar Office</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#004ac6] hover:underline">Academic Regulations</a>
            <span>•</span>
            <a href="#" className="hover:text-[#004ac6] hover:underline">Grievance Cell</a>
            <span>•</span>
            <a href="#" className="hover:text-[#004ac6] hover:underline">IT Helpdesk</a>
          </div>
        </footer>
      </main>
    </>
  );
}
