import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Topbar from '../layouts/Topbar.jsx';
import Icon from '../components/Icon.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import DeleteModal from '../components/DeleteModal.jsx';
import Toast from '../components/Toast.jsx';
import { getStudents, deleteStudent, exportRoster } from '../services/studentService.js';
import { DEPARTMENTS, ACADEMIC_YEARS } from '../data/mockData.js';
import { getCgpaColor, getAttendanceColor } from '../utils/helpers.js';

const PAGE_SIZE = 10;

export default function StudentsListPage() {
  const navigate = useNavigate();
  const ctx = useOutletContext();

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Data
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Load students
  const loadStudents = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, total } = await getStudents({
        search: debouncedSearch,
        department: deptFilter,
        year: yearFilter,
        status: statusFilter,
      });
      setStudents(data);
      setTotalCount(total);
      setPage(1);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch student directory.');
      setToast({ message: err.message || 'Failed to fetch student directory.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, deptFilter, yearFilter, statusFilter]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const pagedStudents = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Active filters for chips
  const activeFilters = [
    debouncedSearch && { key: 'search', label: `Query: "${debouncedSearch}"`, clear: () => setSearch('') },
    deptFilter && { key: 'dept', label: `Dept: ${DEPARTMENTS.find(d => d.value === deptFilter)?.label || deptFilter}`, clear: () => setDeptFilter('') },
    yearFilter && { key: 'year', label: `Year: ${yearFilter}${['st','nd','rd','th'][+yearFilter - 1] || 'th'} Year`, clear: () => setYearFilter('') },
    statusFilter && { key: 'status', label: `Status: ${statusFilter}`, clear: () => setStatusFilter('') },
  ].filter(Boolean);

  function clearAll() {
    setSearch(''); setDeptFilter(''); setYearFilter(''); setStatusFilter('');
  }

  async function handleDelete(id) {
    try {
      await deleteStudent(id);
      setDeleteTarget(null);
      setToast({ message: 'Student record permanently deleted.', type: 'success' });
      loadStudents();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleExport() {
    await exportRoster({ search: debouncedSearch, department: deptFilter, year: yearFilter, status: statusFilter });
    setToast({ message: 'Roster exported as CSV.', type: 'success' });
  }

  return (
    <>
      <Topbar
        onMenuToggle={ctx?.onMenuToggle}
        breadcrumbs={[
          { label: 'Academics', to: '/dashboard' },
          { label: 'Students Roster' },
        ]}
        searchPlaceholder="Search directory..."
      />

      <main className="flex-1 p-4 md:p-6 flex flex-col gap-5 overflow-y-auto">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-headline-lg text-[#0b1c30]">Student Directory &amp; Records</h1>
            <p className="text-body-md text-[#434655] mt-0.5">
              Manage institutional enrollments, academic standing, and student profiles across all departments.
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-3">
            <button onClick={handleExport} className="btn-secondary">
              <Icon name="file_download" size={18} />
              Export Roster
            </button>
            <button onClick={() => navigate('/students/new')} className="btn-primary">
              <Icon name="person_add" size={18} />
              + Add New Student
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search */}
            <div className="md:col-span-5 relative">
              <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d556b]" />
              <input
                type="text"
                placeholder="Search by name, roll number, or institutional email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input pl-9"
              />
            </div>
            {/* Department */}
            <div className="md:col-span-3 relative">
              <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="form-select">
                <option value="">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <Icon name="expand_more" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4d556b]" />
            </div>
            {/* Year */}
            <div className="md:col-span-2 relative">
              <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="form-select">
                <option value="">All Years</option>
                {ACADEMIC_YEARS.map(y => <option key={y.value} value={y.value}>{y.value}{['st','nd','rd','th'][+y.value-1]} Year</option>)}
              </select>
              <Icon name="expand_more" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4d556b]" />
            </div>
            {/* Status */}
            <div className="md:col-span-2 relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="suspended">Suspended</option>
                <option value="probation">Probation</option>
                <option value="graduated">Graduated</option>
              </select>
              <Icon name="expand_more" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4d556b]" />
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-[#e5eeff]">
              <span className="text-label-xs text-[#4d556b] uppercase tracking-wider font-bold mr-1">Active Filters:</span>
              {activeFilters.map(f => (
                <span key={f.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm text-[#004ac6] border border-[#c3c6d7]"
                  style={{ backgroundColor: '#dce9ff' }}>
                  {f.label}
                  <button onClick={f.clear} className="hover:text-[#ba1a1a] flex items-center">
                    <Icon name="close" size={13} />
                  </button>
                </span>
              ))}
              <button onClick={clearAll} className="text-[#4d556b] hover:text-[#ba1a1a] text-label-sm underline ml-2">
                Clear All
              </button>
              <span className="ml-auto text-label-sm text-[#434655]">
                Showing <strong className="text-[#0b1c30]">{students.length}</strong> {students.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[840px]">
              <thead>
                <tr className="border-b border-[#c3c6d7] h-10 text-label-xs text-[#4d556b] uppercase tracking-wider"
                  style={{ backgroundColor: '#f8f9ff' }}>
                  <th className="py-2.5 px-4 w-12 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded accent-[#2563eb] cursor-pointer" />
                  </th>
                  <th className="py-2.5 px-4 font-semibold min-w-[110px]">Roll Number</th>
                  <th className="py-2.5 px-4 font-semibold min-w-[190px]">Student Name &amp; Email</th>
                  <th className="py-2.5 px-4 font-semibold min-w-[170px]">Department &amp; Branch</th>
                  <th className="py-2.5 px-4 font-semibold min-w-[120px]">Academic Year</th>
                  <th className="py-2.5 px-4 font-semibold min-w-[145px]">Attendance / CGPA</th>
                  <th className="py-2.5 px-4 font-semibold min-w-[105px]">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right min-w-[115px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5eeff] text-body-sm">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#434655]">
                        <Icon name="hourglass_empty" size={36} className="text-[#737686] animate-spin" />
                        <span className="text-body-md">Loading students...</span>
                      </div>
                    </td>
                  </tr>
                ) : errorMessage ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FEF2F2] text-[#991B1B]">
                          <Icon name="error_outline" size={28} />
                        </div>
                        <h3 className="text-headline-sm text-[#0b1c30]">Unable to Load Students</h3>
                        <p className="text-body-sm text-[#ba1a1a]">{errorMessage}</p>
                        <button onClick={loadStudents} className="btn-secondary mt-2">
                          <Icon name="refresh" size={16} />
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : pagedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#e5eeff' }}>
                          <Icon name="person_search" size={26} className="text-[#004ac6]" />
                        </div>
                        <h3 className="text-headline-sm text-[#0b1c30]">No students found</h3>
                        <p className="text-body-sm text-[#434655] max-w-sm">
                          No students match your current filters. Try adjusting the search or filter criteria.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={clearAll} className="btn-primary" style={{ height: 36, fontSize: 13 }}>
                            Reset Filters
                          </button>
                          <button onClick={() => navigate('/students/new')} className="btn-secondary" style={{ height: 36, fontSize: 13 }}>
                            Add New Record
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedStudents.map(student => (
                    <tr key={student.id} className="h-[52px] bg-white hover:bg-[#f8f9ff] transition-colors">
                      <td className="py-2.5 px-4 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded accent-[#2563eb] cursor-pointer" />
                      </td>
                      <td className="py-2.5 px-4 font-mono text-data-tabular font-medium text-[#004ac6]">
                        {student.rollNumber}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-label-sm font-bold"
                            style={{ backgroundColor: student.avatarColor || '#dbe1ff', color: student.avatarTextColor || '#004ac6' }}>
                            {student.avatarInitials || (student.fullName ? student.fullName.slice(0, 2).toUpperCase() : 'ST')}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-label-md font-semibold text-[#0b1c30]">{student.fullName}</span>
                            <span className="text-body-sm text-[#434655] text-[12px]">{student.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#0b1c30]">
                            {(student.departmentLabel || student.department || 'Engineering').split(' &')[0]}
                          </span>
                          <span className="text-[12px] text-[#4d556b]">{student.branch || 'B.Tech'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-label-sm text-[#0b1c30]">
                          Year {student.academicYear} (Sem {student.semester})
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-label-xs font-semibold"
                            style={{ backgroundColor: '#e5eeff', color: '#0b1c30' }}>
                            {student.attendance}%
                          </span>
                          <span className={`font-semibold text-data-tabular ${getCgpaColor(student.cgpa)}`}
                            style={{ fontFeatureSettings: '"tnum"' }}>
                            {student.cgpa} CGPA
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/students/${student.id}`)}
                            className="p-1.5 rounded text-[#4d556b] hover:text-[#004ac6] hover:bg-[#e5eeff] transition-colors"
                            title="View Profile"
                          >
                            <Icon name="visibility" size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/students/${student.id}/edit`)}
                            className="p-1.5 rounded text-[#4d556b] hover:text-[#004ac6] hover:bg-[#e5eeff] transition-colors"
                            title="Edit Student"
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(student)}
                            className="p-1.5 rounded text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                            title="Delete Student Record"
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && students.length > 0 && (
            <div className="px-4 py-3 border-t border-[#c3c6d7] flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{ backgroundColor: '#fff' }}>
              <div className="flex items-center gap-3">
                <span className="text-body-sm text-[#434655]">
                  Showing{' '}
                  <span className="font-semibold text-[#0b1c30]">{(page - 1) * PAGE_SIZE + 1}</span> to{' '}
                  <span className="font-semibold text-[#0b1c30]">
                    {Math.min(page * PAGE_SIZE, students.length)}
                  </span> of{' '}
                  <span className="font-semibold text-[#0b1c30]">{students.length}</span> students
                </span>
              </div>
              <div className="flex items-center gap-1 text-label-sm">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-2.5 rounded border border-[#c3c6d7] text-[#434655] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e5eeff] flex items-center"
                >
                  <Icon name="chevron_left" size={18} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`h-8 w-8 rounded flex items-center justify-center transition-colors
                        ${page === pg
                          ? 'text-white font-semibold shadow-sm'
                          : 'text-[#0b1c30] hover:bg-[#e5eeff]'
                        }`}
                      style={page === pg ? { backgroundColor: '#004ac6' } : {}}
                    >
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="px-1 text-[#4d556b]">...</span>}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-2.5 rounded border border-[#c3c6d7] text-[#434655] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e5eeff] flex items-center"
                >
                  <Icon name="chevron_right" size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-[#c3c6d7] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-label-xs text-[#737686]">
          <span>Apex University Student Information &amp; Records System (ApexSIRS v4.8) · Registrar Office</span>
          <span className="font-semibold text-[#004ac6]">Confidential Faculty Record · Audit Log ID: 9482-CS-2024</span>
        </footer>
      </main>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        student={deleteTarget}
      />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </>
  );
}
