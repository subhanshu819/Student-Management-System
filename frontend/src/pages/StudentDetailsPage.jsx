import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import Topbar from '../layouts/Topbar.jsx';
import Icon from '../components/Icon.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import DeleteModal from '../components/DeleteModal.jsx';
import Toast from '../components/Toast.jsx';
import { getStudent, deleteStudent } from '../services/studentService.js';
import { getCgpaColor, getAttendanceColor } from '../utils/helpers.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="text-label-xs text-[#737686] uppercase tracking-wider">{label}</span>
      <span className="text-body-md text-[#0b1c30] font-medium">{value || '—'}</span>
    </div>
  );
}

function GradeChip({ grade }) {
  const gradeColors = {
    'A+': { bg: '#ECFDF5', text: '#065F46' },
    'A': { bg: '#eff4ff', text: '#004ac6' },
    'B+': { bg: '#eff4ff', text: '#004ac6' },
    'B': { bg: '#FFFBEB', text: '#92400E' },
    'C': { bg: '#FFFBEB', text: '#92400E' },
  };
  const style = gradeColors[grade] || { bg: '#e5eeff', text: '#0b1c30' };
  return (
    <span className="inline-flex items-center justify-center w-9 h-7 rounded-lg text-label-sm font-bold"
      style={{ backgroundColor: style.bg, color: style.text }}>
      {grade || 'A'}
    </span>
  );
}

export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ctx = useOutletContext();
  const { isAdmin } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('academic');
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getStudent(id).then(({ data }) => {
      setStudent(data);
      setLoading(false);
    }).catch(err => {
      setError(err.message || 'Unable to load student record');
      setLoading(false);
    });
  }, [id]);

  async function handleDelete(sid) {
    try {
      await deleteStudent(sid);
      setShowDelete(false);
      navigate('/students');
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#434655]">
          <Icon name="hourglass_empty" size={40} className="text-[#737686]" />
          <span>Loading student profile...</span>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#FEF2F2] text-[#991B1B]">
            <Icon name="person_off" size={36} />
          </div>
          <h2 className="text-headline-sm text-[#0b1c30]">Student Record Unavailable</h2>
          <p className="text-body-sm text-[#434655] mt-2 mb-4">
            {error || 'The requested student record could not be found or you do not have permission to access it.'}
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'academic', label: 'Academic Record', icon: 'school' },
    { key: 'attendance', label: 'Attendance Log', icon: 'calendar_today' },
    { key: 'fees', label: 'Fee & Dues Status', icon: 'credit_card' },
    { key: 'activity', label: 'Disciplinary & Activity Log', icon: 'assignment' },
  ];

  const earnedCredits = student.totalCredits || 132;
  const maxCreds = student.maxCredits || 160;
  const creditPercent = Math.round((earnedCredits / maxCreds) * 100);

  return (
    <>
      <Topbar
        onMenuToggle={ctx?.onMenuToggle}
        breadcrumbs={[
          { label: 'Academics', to: '/dashboard' },
          { label: 'Students', to: '/students' },
          { label: student.fullName, to: `/students/${id}` },
          { label: 'Academic Profile' },
        ]}
        searchPlaceholder="Search by ID, name or course..."
      />

      <main className="flex-1 p-4 md:p-6 flex flex-col gap-5 overflow-y-auto">
        {/* Profile header card */}
        <div className="card p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-headline-md font-bold shadow-sm"
                style={{ backgroundColor: student.avatarColor || '#dbe1ff', color: student.avatarTextColor || '#004ac6' }}>
                {student.avatarInitials || (student.fullName ? student.fullName.slice(0, 2).toUpperCase() : 'ST')}
              </div>
              {student.status === 'active' && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#ECFDF5', border: '2px solid #fff' }}>
                  <Icon name="check_circle" size={14} filled className="text-[#10B981]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-headline-md text-[#0b1c30]">{student.fullName}</h1>
                <StatusBadge status={student.status} />
                <span className="text-label-xs text-[#434655] px-2 py-1 rounded border border-[#c3c6d7] font-mono">
                  ID: {student.rollNumber}
                </span>
              </div>
              <p className="text-body-md text-[#434655]">
                Department of {student.departmentLabel || student.department || 'Engineering'}
              </p>
              <div className="flex flex-wrap gap-3 mt-2 text-body-sm text-[#434655]">
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar_today" size={14} />
                  {student.academicYear === '3' ? '3rd' : `${student.academicYear || 1}${['st','nd','rd','th'][Number(student.academicYear) - 1] || 'th'}`} Year · {student.degree || 'B.Tech'} ({student.batch || 'Batch 2021-2025'})
                </span>
                <span className="text-[#c3c6d7]">•</span>
                <span className="flex items-center gap-1.5">
                  <Icon name="groups" size={14} />
                  {student.division || 'Division A'}
                </span>
                {student.facultyAdvisor && (
                  <>
                    <span className="text-[#c3c6d7]">•</span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="person" size={14} />
                      Faculty Mentor: {student.facultyAdvisor}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <button onClick={() => navigate(`/students/${id}/edit`)} className="btn-secondary" style={{ height: 36, fontSize: 13 }}>
                <Icon name="edit" size={16} />
                Edit Record
              </button>
              <button className="btn-secondary" style={{ height: 36, fontSize: 13 }}>
                <Icon name="print" size={16} />
                Print ID Slip
              </button>
              <button className="btn-primary" style={{ height: 36, fontSize: 13 }}>
                <Icon name="download" size={16} />
                Download Transcript PDF
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CGPA */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm text-[#434655]">Current CGPA</span>
              <Icon name="grade" size={18} className="text-[#737686]" />
            </div>
            <div className={`text-headline-md font-bold ${getCgpaColor(student.cgpa)}`} style={{ fontFeatureSettings: '"tnum"' }}>
              {student.cgpa} <span className="text-body-md text-[#737686] font-normal">/ 10.0</span>
            </div>
            <span className="text-label-sm text-[#006c49] flex items-center gap-1 mt-1">
              <Icon name="trending_up" size={13} />
              Top 5% of Department
            </span>
          </div>
          {/* Credits */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm text-[#434655]">Total Earned Credits</span>
              <Icon name="workspace_premium" size={18} className="text-[#737686]" />
            </div>
            <div className="text-headline-md font-bold text-[#0b1c30]" style={{ fontFeatureSettings: '"tnum"' }}>
              {student.totalCredits} <span className="text-body-md text-[#737686] font-normal">/ {student.maxCredits} Credits</span>
            </div>
            <div className="mt-2 w-full h-1.5 rounded-full" style={{ backgroundColor: '#e5eeff' }}>
              <div className="h-1.5 rounded-full" style={{ width: `${creditPercent}%`, backgroundColor: '#2563eb' }} />
            </div>
            <span className="text-label-sm text-[#434655] mt-1 block">{creditPercent}% curriculum completed</span>
          </div>
          {/* Attendance */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm text-[#434655]">Overall Attendance</span>
              <Icon name="event_available" size={18} className="text-[#737686]" />
            </div>
            <div className={`text-headline-md font-bold ${getAttendanceColor(student.attendance)}`}>
              {student.attendance}%
            </div>
            <span className="text-label-sm flex items-center gap-1 mt-1" style={{ color: student.attendance >= 75 ? '#006c49' : '#ba1a1a' }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: student.attendance >= 75 ? '#10B981' : '#EF4444' }} />
              {student.attendance >= 75 ? 'Above 75% mandatory threshold' : 'Below mandatory threshold'}
            </span>
          </div>
          {/* Semester standing */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm text-[#434655]">Semester Standing</span>
              <Icon name="verified" size={18} className="text-[#737686]" />
            </div>
            <div className="text-headline-sm text-[#0b1c30]">{student.semesterStanding}</div>
            <span className={`text-label-sm flex items-center gap-1 mt-1 ${student.activeBacklogs === 0 ? 'text-[#006c49]' : 'text-[#ba1a1a]'}`}>
              <Icon name={student.activeBacklogs === 0 ? 'check_circle' : 'warning'} size={13} filled />
              {student.activeBacklogs === 0 ? '0 Active Backlogs' : `${student.activeBacklogs} Active Backlogs`}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#c3c6d7]">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-label-md font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.key
                    ? 'border-[#2563eb] text-[#004ac6]'
                    : 'border-transparent text-[#434655] hover:text-[#0b1c30] hover:border-[#c3c6d7]'
                  }`}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Personal info */}
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-headline-sm text-[#0b1c30] flex items-center gap-2">
                  <Icon name="badge" size={18} className="text-[#4d556b]" />
                  Personal &amp; Contact Details
                </h2>
                <span className="text-label-xs font-bold text-[#006c49] px-2 py-0.5 rounded"
                  style={{ backgroundColor: '#ECFDF5' }}>
                  {student.kycStatus || 'KYC VERIFIED'}
                </span>
              </div>
              <div className="divide-y divide-[#e5eeff]">
                <InfoRow label="Full Legal Name" value={student.fullName} />
                <InfoRow label="Enrolment Date" value={student.enrollmentDate} />
                <InfoRow label="Institutional Email" value={student.email} />
                <InfoRow label="Mobile Number" value={student.phone} />
                <div className="grid grid-cols-2 gap-2">
                  <InfoRow label="Blood Group" value={student.bloodGroup} />
                  <InfoRow label="Gender" value={student.gender} />
                </div>
                <InfoRow label="Guardian Name & Relation" value={`${student.guardianName} (${student.guardianRelation})`} />
                <InfoRow label="Guardian Phone" value={student.guardianPhone} />
                <InfoRow label="Permanent Residential Address" value={student.address} />
              </div>
              {student.hostel && (
                <div className="mt-3 p-3 rounded-xl flex items-center justify-between text-body-sm"
                  style={{ backgroundColor: '#eff4ff', border: '1px solid #c3c6d7' }}>
                  <div className="flex items-center gap-2">
                    <Icon name="hotel" size={16} className="text-[#4d556b]" />
                    <span className="font-medium text-[#0b1c30]">{student.hostel}</span>
                  </div>
                  {student.hostel !== 'Day Scholar' && (
                    <span className="badge-active">Resident</span>
                  )}
                </div>
              )}
            </div>

            {/* Courses */}
            <div className="card p-5 lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-headline-sm text-[#0b1c30] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2563eb' }} />
                  Current Semester Courses &amp; Evaluation
                </h2>
                <span className="text-label-xs font-bold px-2 py-0.5 rounded-full text-[#004ac6]"
                  style={{ backgroundColor: '#eff4ff', border: '1px solid #2563eb' }}>
                  {student.courses?.length || 0} Enrolled
                </span>
              </div>
              {student.courses && student.courses.length > 0 ? (
                <>
                  <p className="text-body-sm text-[#434655] mb-3">Odd Semester (July - Dec 2024)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[#c3c6d7] text-label-xs text-[#4d556b] uppercase tracking-wider">
                          <th className="pb-2 pr-4 font-semibold">Course Name &amp; Code</th>
                          <th className="pb-2 pr-4 font-semibold">Instructor</th>
                          <th className="pb-2 pr-4 font-semibold text-right">Attendance</th>
                          <th className="pb-2 pr-4 font-semibold text-center">Grade</th>
                          <th className="pb-2 font-semibold text-right">Credits</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5eeff]">
                        {student.courses.map(course => (
                          <tr key={course.code} className="py-3">
                            <td className="py-3 pr-4">
                              <div className="text-label-md font-semibold text-[#0b1c30]">{course.name}</div>
                              <div className="text-body-sm text-[#4d556b]">{course.code}</div>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-1.5">
                                <Icon name="person" size={14} className="text-[#737686] flex-shrink-0" />
                                <span className="text-body-sm text-[#434655]">{course.instructor}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <span className={`text-label-md font-semibold ${getAttendanceColor(course.attendance)}`}>
                                {course.attendance}%
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-center">
                              <GradeChip grade={course.internalGrade} />
                            </td>
                            <td className="py-3 text-right text-label-md font-semibold text-[#0b1c30]">
                              {course.credits}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#e5eeff] flex items-center justify-between text-body-sm text-[#434655]">
                    <span>Weighted SGPA Forecast: <strong className="text-[#0b1c30]">8.95</strong> (Based on Internal Assessment)</span>
                    <button className="text-[#004ac6] font-semibold hover:underline flex items-center gap-1">
                      View Past Semesters Archive <Icon name="arrow_forward" size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-[#434655]">
                  <Icon name="menu_book" size={36} className="text-[#c3c6d7] mb-2" />
                  <p className="text-body-md">No current courses to display.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placeholder tabs */}
        {activeTab !== 'academic' && (
          <div className="card p-12 text-center text-[#434655]">
            <Icon name="construction" size={40} className="text-[#c3c6d7] mb-3" />
            <h3 className="text-headline-sm text-[#0b1c30]">Coming Soon</h3>
            <p className="text-body-md mt-1">
              The <strong>{tabs.find(t => t.key === activeTab)?.label}</strong> section will be available in the next phase.
            </p>
          </div>
        )}

        {/* Delete button row (Admin only) */}
        {isAdmin && (
          <div className="flex justify-end">
            <button onClick={() => setShowDelete(true)} className="btn-destructive" style={{ height: 36, fontSize: 13 }}>
              <Icon name="delete_forever" size={16} />
              Delete Student Record
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-[#c3c6d7] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-label-xs text-[#737686]">
          <span>Apex University Student Information &amp; Records System (ApexSIRS v4.8) · Registrar Office</span>
          <span>Confidential Faculty Record · Audit Log ID: 9482-CS-2024</span>
        </footer>
      </main>

      <DeleteModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        student={student}
      />
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </>
  );
}
