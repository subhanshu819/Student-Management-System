import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import Topbar from '../layouts/Topbar.jsx';
import Icon from '../components/Icon.jsx';
import DeleteModal from '../components/DeleteModal.jsx';
import Toast from '../components/Toast.jsx';
import { getStudent, updateStudent, deleteStudent } from '../services/studentService.js';
import { DEPARTMENTS, ACADEMIC_YEARS, FACULTY_ADVISORS, STUDENT_STATUSES } from '../data/mockData.js';

export default function EditStudentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ctx = useOutletContext();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    department: '',
    academicYear: '',
    cgpa: '',
    facultyAdvisor: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    getStudent(id)
      .then(({ data }) => {
        setStudent(data);
        setFormData({
          fullName: data.fullName || '',
          rollNumber: data.rollNumber || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          department: data.department || 'cs',
          academicYear: data.academicYear || '1',
          cgpa: data.cgpa ? String(data.cgpa) : '0.0',
          facultyAdvisor: data.facultyAdvisor || FACULTY_ADVISORS[0],
          status: data.status || 'active',
        });
        setLoading(false);
      })
      .catch(err => {
        setToast({ message: err.message || 'Student not found.', type: 'error' });
        setLoading(false);
      });
  }, [id]);

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }

  function validate() {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    if (!formData.department) errs.department = 'Department is required';
    if (!formData.academicYear) errs.academicYear = 'Academic Year is required';
    if (!formData.status) errs.status = 'Status is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      setToast({ message: 'Please correct the highlighted fields.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const selectedDept = DEPARTMENTS.find(d => d.value === formData.department);
      const updates = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth,
        department: formData.department,
        departmentLabel: selectedDept ? selectedDept.label : student.departmentLabel,
        academicYear: formData.academicYear,
        cgpa: parseFloat(formData.cgpa) || student.cgpa,
        facultyAdvisor: formData.facultyAdvisor,
        status: formData.status,
      };

      await updateStudent(id, updates);
      setToast({ message: 'Student record updated successfully!', type: 'success' });
      setTimeout(() => {
        navigate(`/students/${id}`);
      }, 1000);
    } catch (err) {
      setToast({ message: err.message || 'Failed to update record.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm(targetId) {
    try {
      await deleteStudent(targetId);
      setShowDelete(false);
      navigate('/students');
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete record.', type: 'error' });
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3 text-[#434655]">
          <Icon name="hourglass_empty" size={40} className="text-[#737686] animate-spin" />
          <span className="text-body-md">Loading student details...</span>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] gap-4 p-8">
        <Icon name="person_off" size={48} className="text-[#ba1a1a]" />
        <h2 className="text-headline-md text-[#0b1c30]">Student Not Found</h2>
        <button onClick={() => navigate('/students')} className="btn-primary">
          Back to Students Directory
        </button>
      </div>
    );
  }

  return (
    <>
      <Topbar
        onMenuToggle={ctx?.onMenuToggle}
        breadcrumbs={[
          { label: 'Academics', to: '/dashboard' },
          { label: 'Students', to: '/students' },
          { label: `${student.fullName} (${student.rollNumber})`, to: `/students/${id}` },
          { label: 'Edit Details' },
        ]}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showDelete && (
        <DeleteModal
          student={student}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDelete(false)}
        />
      )}

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Meta Badges & Last Modified Stamp */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dce9ff] text-[#004ac6] text-label-xs font-semibold border border-[#004ac6]/20">
              <Icon name="edit_note" size={14} />
              Editing Record: {student.rollNumber}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5eeff] text-[#434655] text-label-xs">
              <Icon name="history" size={14} className="text-[#737686]" />
              Last modified: Oct 14, 2024 by Dean Office
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/students/${id}`)}
            className="inline-flex items-center gap-1 text-[#004ac6] hover:text-[#00174b] text-label-sm font-semibold transition-colors"
          >
            <Icon name="visibility" size={16} />
            View Public Profile
          </button>
        </div>

        {/* Main Content Header */}
        <div className="space-y-1">
          <h1 className="text-headline-lg font-bold text-[#0b1c30] tracking-tight">
            Edit Student Information — {student.fullName}
          </h1>
          <p className="text-body-lg text-[#434655]">
            Update academic records, contact info, and enrollment status for {student.departmentLabel}.
          </p>
        </div>

        {/* Informative Operational Notice Banner */}
        <div className="bg-[#eff4ff] border border-[#dce9ff] rounded-xl p-4 flex items-start gap-4 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="info" size={20} className="text-white" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-title-md font-semibold text-[#0b1c30]">Enrollment Notice &amp; Audit Advisory</h2>
            <p className="text-body-sm text-[#434655] leading-relaxed">
              Student is currently enrolled in AY 2026–27 (Odd Semester). Changes to Department or Roll Number require Registrar re-verification.
            </p>
          </div>
        </div>

        {/* FORM CARD CONTAINER */}
        <div className="card overflow-hidden shadow-sm">
          {/* Form Header Section */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#c3c6d7]/30 flex items-center justify-between bg-[#f8f9ff]">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004ac6]"></span>
              <span className="text-title-md font-semibold text-[#0b1c30]">Undergraduate Candidate Dossier</span>
            </div>
            <span className="text-label-xs text-[#434655] flex items-center gap-1">
              <span className="text-[#ba1a1a] font-bold">*</span> Mandatory university registrar fields
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-8">
            {/* SECTION 1: Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#c3c6d7]/20">
                <Icon name="badge" size={20} className="text-[#004ac6]" />
                <h2 className="text-title-md font-semibold text-[#0b1c30]">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-label-md text-[#0b1c30] font-medium" htmlFor="fullName">
                    Full Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={e => handleChange('fullName', e.target.value)}
                    className={`w-full h-10 px-3 rounded-lg border ${errors.fullName ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c3c6d7]'} bg-white text-[#0b1c30] text-body-md focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-all shadow-sm`}
                  />
                  {errors.fullName && <p className="text-label-xs text-[#ba1a1a]">{errors.fullName}</p>}
                </div>

                {/* Roll Number (Locked) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-label-md text-[#0b1c30] font-medium" htmlFor="rollNumber">
                      Roll Number <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#004ac6] text-label-xs font-semibold">
                      <Icon name="lock" size={12} />
                      Locked by Registrar
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="rollNumber"
                      type="text"
                      value={formData.rollNumber}
                      readOnly
                      className="w-full h-10 px-3 pl-9 rounded-lg border border-[#c3c6d7] bg-[#e5eeff] text-[#434655] text-data-tabular cursor-not-allowed select-none font-semibold tracking-wide"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737686]">
                      <Icon name="lock" size={18} />
                    </span>
                  </div>
                  <p className="text-label-xs text-[#434655]">UID locked to semester admission register.</p>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-label-md text-[#0b1c30] font-medium" htmlFor="email">
                    Email <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      className={`w-full h-10 px-3 pl-9 rounded-lg border ${errors.email ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c3c6d7]'} bg-white text-[#0b1c30] text-body-md focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-all shadow-sm`}
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737686]">
                      <Icon name="mail" size={18} />
                    </span>
                  </div>
                  {errors.email && <p className="text-label-xs text-[#ba1a1a]">{errors.email}</p>}
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="block text-label-md text-[#0b1c30] font-medium" htmlFor="phone">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      className="w-full h-10 px-3 pl-9 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-data-tabular focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-all shadow-sm"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737686]">
                      <Icon name="call" size={18} />
                    </span>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="block text-label-md text-[#0b1c30] font-medium" htmlFor="dob">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      id="dob"
                      type="text"
                      value={formData.dateOfBirth}
                      onChange={e => handleChange('dateOfBirth', e.target.value)}
                      placeholder="DD-MM-YYYY"
                      className="w-full h-10 px-3 pl-9 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-data-tabular focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-all shadow-sm"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737686]">
                      <Icon name="calendar_today" size={18} />
                    </span>
                  </div>
                </div>

                {/* Secondary Identity Verification Indicator */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <div className="h-10 px-3 rounded-lg border border-[#c3c6d7]/60 bg-[#f8f9ff] flex items-center justify-between text-[#434655] text-label-sm">
                    <span className="flex items-center gap-1.5">
                      <Icon name="verified_user" size={18} className="text-[#006c49]" />
                      National ID Status: Active
                    </span>
                    <span className="font-semibold text-[#004ac6]">AADHAAR Linked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Academic Details */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-[#c3c6d7]/20">
                <Icon name="school" size={20} className="text-[#004ac6]" />
                <h2 className="text-title-md font-semibold text-[#0b1c30]">Academic Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Department */}
                <div className="space-y-1.5">
                  <label className="block text-label-md text-[#0b1c30] font-medium" htmlFor="department">
                    Department <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="department"
                      value={formData.department}
                      onChange={e => handleChange('department', e.target.value)}
                      className="w-full h-10 pl-3 pr-8 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-body-md focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-all shadow-sm cursor-pointer"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Academic Year */}
                <div className="space-y-1.5">
                  <label className="block text-label-md text-[#0b1c30] font-medium" htmlFor="academicYear">
                    Academic Year <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={e => handleChange('academicYear', e.target.value)}
                      className="w-full h-10 pl-3 pr-8 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-body-md focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-all shadow-sm cursor-pointer"
                    >
                      {ACADEMIC_YEARS.map(yr => (
                        <option key={yr.value} value={yr.value}>
                          {yr.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Current CGPA */}
                <div className="space-y-1.5">
                  <label className="block text-label-md text-[#0b1c30] font-medium" htmlFor="cgpa">
                    Current CGPA
                  </label>
                  <div className="relative">
                    <input
                      id="cgpa"
                      type="text"
                      value={formData.cgpa}
                      onChange={e => handleChange('cgpa', e.target.value)}
                      className="w-full h-10 px-3 pl-9 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-data-tabular focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-all shadow-sm font-semibold"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737686]">
                      <Icon name="grade" size={18} />
                    </span>
                  </div>
                </div>

                {/* Assigned Faculty Advisor */}
                <div className="space-y-1.5">
                  <label className="block text-label-md text-[#0b1c30] font-medium" htmlFor="facultyAdvisor">
                    Assigned Faculty Advisor
                  </label>
                  <div className="relative">
                    <select
                      id="facultyAdvisor"
                      value={formData.facultyAdvisor}
                      onChange={e => handleChange('facultyAdvisor', e.target.value)}
                      className="w-full h-10 pl-3 pr-8 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-body-md focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-all shadow-sm cursor-pointer"
                    >
                      {FACULTY_ADVISORS.map(adv => (
                        <option key={adv} value={adv}>
                          {adv}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Student Status */}
                <div className="space-y-1.5">
                  <label className="block text-label-md text-[#0b1c30] font-medium" htmlFor="studentStatus">
                    Student Status <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="studentStatus"
                      value={formData.status}
                      onChange={e => handleChange('status', e.target.value)}
                      className="w-full h-10 pl-3 pr-8 rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] text-body-md focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-all shadow-sm cursor-pointer"
                    >
                      {STUDENT_STATUSES.map(st => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Enrollment Standing Preview */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <div className="h-10 px-3 rounded-lg border border-[#c3c6d7]/60 bg-[#f8f9ff] flex items-center justify-between">
                    <span className="text-label-sm text-[#434655]">Live Enrollment State:</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-xs font-semibold ${
                      formData.status === 'active'
                        ? 'bg-[#ECFDF5] text-[#065F46]'
                        : formData.status === 'on_leave'
                        ? 'bg-[#FFFBEB] text-[#92400E]'
                        : 'bg-[#FEF2F2] text-[#991B1B]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        formData.status === 'active'
                          ? 'bg-[#10B981]'
                          : formData.status === 'on_leave'
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#EF4444]'
                      }`}></span>
                      {formData.status.toUpperCase()} CANDIDATE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation / Sync confirmation */}
            <div className="p-4 rounded-lg bg-[#e5eeff] border border-[#dce9ff] flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-2.5 text-[#434655] text-label-sm">
                <Icon name="check_circle" size={20} className="text-[#006c49]" fill={1} />
                <span className="font-medium">All credentials verified against university registrar database.</span>
              </div>
              <span className="text-[#737686] text-data-tabular">Hash: 8b2c-9a4f-cs21</span>
            </div>

            {/* FORM FOOTER ACTIONS */}
            <div className="pt-6 border-t border-[#c3c6d7]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left: Destructive Action */}
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-[#ba1a1a]/40 text-[#ba1a1a] hover:bg-[#ffdad6]/20 text-label-md font-semibold transition-all active:scale-[0.98]"
              >
                <Icon name="delete_outline" size={18} />
                <span>Delete Student</span>
              </button>

              {/* Right: Secondary & Primary Actions */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/students/${id}`)}
                  className="w-full sm:w-auto btn-secondary"
                  style={{ height: 40 }}
                >
                  Cancel / Revert Changes
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 shadow-sm"
                  style={{ height: 40 }}
                >
                  <Icon name="save" size={18} />
                  <span>{saving ? 'Saving Changes...' : 'Save & Update Record'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Institutional Help Footer */}
        <footer className="pt-4 pb-8 flex flex-wrap items-center justify-between text-[#434655] text-label-xs border-t border-[#c3c6d7]/20 gap-2">
          <span>Apex University Administrative Core • Release 24.4.1 (Production)</span>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:underline">Registrar Regulations</a>
            <a href="#" className="hover:underline">FERPA &amp; Academic Data Privacy</a>
            <a href="#" className="hover:underline">Contact System Admin</a>
          </div>
        </footer>
      </main>
    </>
  );
}
