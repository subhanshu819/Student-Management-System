import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Topbar from '../layouts/Topbar.jsx';
import Icon from '../components/Icon.jsx';
import Toast from '../components/Toast.jsx';
import { createStudent } from '../services/studentService.js';
import { DEPARTMENTS, ACADEMIC_YEARS, FACULTY_ADVISORS } from '../data/mockData.js';

export default function AddStudentPage() {
  const navigate = useNavigate();
  const ctx = useOutletContext();

  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    dob: '',
    emailPrefix: '',
    phone: '',
    gender: 'Male',
    bloodGroup: 'B+ (Positive)',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    address: '',
    hostel: 'Day Scholar',
    department: 'cs',
    degree: 'btech',
    academicYear: '1',
    semester: 'I',
    facultyAdvisor: FACULTY_ADVISORS[0] || 'Dr. K. S. Ramanujam',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [dismissWarning, setDismissWarning] = useState(false);

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }

  function validate() {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full legal name is required';
    if (!formData.rollNumber.trim()) errs.rollNumber = 'Roll / Enrolment number is required';
    if (!formData.dob) errs.dob = 'Date of birth is required';
    if (!formData.emailPrefix.trim()) errs.emailPrefix = 'Email identifier is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Contact number is required';
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!formData.department) errs.department = 'Department is required';
    if (!formData.academicYear) errs.academicYear = 'Academic year is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      setToast({ message: 'Please correct the highlighted fields before submitting.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const selectedDept = DEPARTMENTS.find(d => d.value === formData.department);
      const email = `${formData.emailPrefix.trim().toLowerCase()}@apex.edu.in`;

      await createStudent({
        fullName: formData.fullName.trim(),
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        email: email,
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone}`,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        guardianName: formData.guardianName || 'N/A',
        guardianRelation: formData.guardianRelation || 'Guardian',
        guardianPhone: formData.guardianPhone || 'N/A',
        address: formData.address || 'Campus Residential Facility',
        hostel: formData.hostel,
        department: formData.department,
        departmentLabel: selectedDept ? selectedDept.label : 'Engineering',
        branch: formData.degree === 'btech' ? 'B.Tech' : formData.degree === 'mtech' ? 'M.Tech' : 'Dual Degree',
        academicYear: formData.academicYear,
        semester: formData.academicYear === '1' ? 'I' : formData.academicYear === '2' ? 'III' : formData.academicYear === '3' ? 'V' : 'VII',
        facultyAdvisor: formData.facultyAdvisor,
        status: formData.status,
        cgpa: 0.0,
        attendance: 100.0,
        enrollmentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });

      setToast({ message: `Student ${formData.fullName} successfully registered!`, type: 'success' });
      setTimeout(() => {
        navigate('/students');
      }, 1200);
    } catch (err) {
      setToast({ message: err.message || 'Failed to register student record.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar
        onMenuToggle={ctx?.onMenuToggle}
        breadcrumbs={[
          { label: 'Academics', to: '/dashboard' },
          { label: 'Students', to: '/students' },
          { label: 'Add Student' },
        ]}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2">
          <div>
            <h1 className="text-headline-lg text-[#0b1c30] font-bold tracking-tight">Register New Student</h1>
            <p className="text-body-md text-[#434655] mt-1">
              Enter student personal, institutional, and academic enrollment details for AY 2026–27.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5eeff] text-label-xs text-[#004ac6] font-semibold border border-[#c3c6d7]">
              <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse"></span>
              Admissions Session 2026–27
            </span>
          </div>
        </div>

        {/* Main Form Wrapper */}
        <form onSubmit={handleSubmit} className="card overflow-hidden shadow-sm">
          {/* Live Form Status Indicator Banner */}
          <div className="bg-[#eff4ff] border-b border-[#c3c6d7] px-4 md:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#004ac6]">
              <Icon name="assignment_turned_in" size={20} />
              <span className="text-label-sm font-semibold">Institutional Validation Engine Active</span>
            </div>
            <div className="flex items-center gap-4 text-[#434655] text-label-xs">
              <span>All marked fields (<span className="text-[#ba1a1a] font-bold">*</span>) are mandatory</span>
              <span className="text-[#737686]">|</span>
              <span className="text-[#006c49] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]"></span> Live auto-check active
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-8">
            {/* Section 1: Personal & Identification Information */}
            <div>
              <div className="flex items-center justify-between border-b border-[#dce9ff] pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#e5eeff] flex items-center justify-center text-[#004ac6] font-bold text-label-sm">
                    01
                  </div>
                  <h2 className="text-headline-sm font-semibold text-[#0b1c30]">Personal &amp; Identification Information</h2>
                </div>
                <span className="text-label-xs uppercase tracking-wider text-[#737686]">Candidate Dossier</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Photo Upload Box */}
                <div className="md:col-span-4 flex flex-col">
                  <label className="text-label-sm font-semibold text-[#0b1c30] mb-2 flex items-center justify-between">
                    <span>Student Photograph</span>
                    <span className="text-[#434655] font-normal text-[11px]">Passport 3.5 × 4.5 cm</span>
                  </label>
                  <div className="flex-1 min-h-[200px] border-2 border-dashed border-[#c3c6d7] rounded-xl p-6 flex flex-col items-center justify-center text-center bg-[#f8f9ff] hover:bg-[#eff4ff] hover:border-[#004ac6] transition-all cursor-pointer group relative">
                    <div className="w-14 h-14 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#004ac6] group-hover:scale-105 transition-transform mb-3 shadow-xs">
                      <Icon name="add_a_photo" size={28} />
                    </div>
                    <p className="text-label-md font-semibold text-[#0b1c30] group-hover:text-[#004ac6] transition-colors">
                      Drag and drop passport size photo
                    </p>
                    <p className="text-body-sm text-[#434655] mt-1">
                      or <span className="text-[#004ac6] underline font-medium">browse local files</span>
                    </p>
                    <p className="text-label-xs text-[#737686] mt-3">PNG, JPG or WEBP (Max 2MB)</p>
                    <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" type="file" />
                  </div>
                </div>

                {/* Form Fields Column */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5" htmlFor="fullName">
                      Full Legal Name <span className="text-[#ba1a1a] font-bold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={e => handleChange('fullName', e.target.value)}
                        placeholder="e.g. Priyanshu Verma"
                        className={`w-full h-10 px-3.5 bg-white border ${errors.fullName ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c3c6d7]'} rounded-md text-body-md text-[#0b1c30] focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] focus:outline-none transition-colors`}
                      />
                      {formData.fullName && !errors.fullName && (
                        <span className="absolute right-3 top-2.5 text-[#006c49]">
                          <Icon name="check_circle" size={20} fill={1} />
                        </span>
                      )}
                    </div>
                    {errors.fullName ? (
                      <p className="text-label-xs text-[#ba1a1a] mt-1">{errors.fullName}</p>
                    ) : (
                      <p className="text-body-sm text-[#434655] mt-1">As stated in 10th Standard / Matriculation certificate.</p>
                    )}
                  </div>

                  {/* Roll Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-label-sm font-semibold text-[#0b1c30]" htmlFor="rollNumber">
                        Roll / Enrolment Number <span className="text-[#ba1a1a] font-bold">*</span>
                      </label>
                      <span className="text-label-xs text-[#ba1a1a] font-medium flex items-center gap-0.5">
                        <Icon name="error" size={14} /> Unique Required
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        id="rollNumber"
                        type="text"
                        value={formData.rollNumber}
                        onChange={e => handleChange('rollNumber', e.target.value.toUpperCase())}
                        placeholder="e.g. 24CS1082"
                        className={`w-full h-10 px-3.5 bg-white border ${errors.rollNumber ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#004ac6] ring-1 ring-[#004ac6]'} rounded-md text-data-tabular font-medium text-[#0b1c30] focus:outline-none`}
                      />
                      <span className="absolute right-3 top-2.5 text-[#004ac6]">
                        <Icon name="badge" size={20} />
                      </span>
                    </div>
                    {errors.rollNumber ? (
                      <p className="text-label-xs text-[#ba1a1a] mt-1">{errors.rollNumber}</p>
                    ) : (
                      <p className="text-body-sm text-[#434655] mt-1">Must follow standard institutional branch-year format.</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5" htmlFor="dob">
                      Date of Birth <span className="text-[#ba1a1a] font-bold">*</span>
                    </label>
                    <input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={e => handleChange('dob', e.target.value)}
                      className={`w-full h-10 px-3.5 bg-white border ${errors.dob ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]' : 'border-[#c3c6d7]'} rounded-md text-body-md text-[#0b1c30] focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] focus:outline-none transition-colors`}
                    />
                    {errors.dob ? (
                      <p className="text-label-xs text-[#ba1a1a] mt-1">{errors.dob}</p>
                    ) : (
                      <p className="text-body-sm text-[#434655] mt-1">Format: YYYY-MM-DD</p>
                    )}
                  </div>

                  {/* Institutional Email Address */}
                  <div>
                    <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5" htmlFor="emailPrefix">
                      Institutional Email Address <span className="text-[#ba1a1a] font-bold">*</span>
                    </label>
                    <div className={`relative flex items-center rounded-md border ${errors.emailPrefix ? 'border-[#ba1a1a]' : 'border-[#006c49]'} shadow-xs overflow-hidden`}>
                      <input
                        id="emailPrefix"
                        type="text"
                        value={formData.emailPrefix}
                        onChange={e => handleChange('emailPrefix', e.target.value)}
                        placeholder="p.verma24"
                        className="w-full h-10 pl-3.5 pr-2 font-body-md text-body-md text-[#0b1c30] focus:outline-none border-none"
                      />
                      <span className="bg-[#eff4ff] px-3 py-2 text-[#004ac6] text-label-sm font-medium border-l border-[#c3c6d7] whitespace-nowrap">
                        @apex.edu.in
                      </span>
                    </div>
                    {errors.emailPrefix ? (
                      <p className="text-label-xs text-[#ba1a1a] mt-1">{errors.emailPrefix}</p>
                    ) : (
                      <div className="flex items-center gap-1 text-[#006c49] mt-1 text-body-sm">
                        <Icon name="check_circle" size={16} fill={1} />
                        <span>Valid institutional domain identifier verified</span>
                      </div>
                    )}
                  </div>

                  {/* Personal Contact Phone */}
                  <div>
                    <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5" htmlFor="phone">
                      Personal Contact Number <span className="text-[#ba1a1a] font-bold">*</span>
                    </label>
                    <div className={`relative flex items-center rounded-md border ${errors.phone ? 'border-[#ba1a1a]' : 'border-[#c3c6d7]'} overflow-hidden`}>
                      <span className="bg-[#eff4ff] px-2.5 py-2 text-[#434655] text-label-sm border-r border-[#c3c6d7]">
                        +91
                      </span>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full h-10 px-3 font-body-md text-body-md text-[#0b1c30] focus:outline-none border-none"
                      />
                    </div>
                    {errors.phone ? (
                      <p className="text-label-xs text-[#ba1a1a] mt-1">{errors.phone}</p>
                    ) : (
                      <p className="text-body-sm text-[#434655] mt-1">Used for student portal 2FA authentication.</p>
                    )}
                  </div>

                  {/* Gender & Blood Group */}
                  <div>
                    <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5" htmlFor="gender">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={e => handleChange('gender', e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-md text-body-md text-[#0b1c30] focus:border-[#004ac6] focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5" htmlFor="bloodGroup">
                      Blood Group
                    </label>
                    <select
                      id="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={e => handleChange('bloodGroup', e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-md text-body-md text-[#0b1c30] focus:border-[#004ac6] focus:outline-none"
                    >
                      <option value="A+ (Positive)">A+ (Positive)</option>
                      <option value="A- (Negative)">A- (Negative)</option>
                      <option value="B+ (Positive)">B+ (Positive)</option>
                      <option value="B- (Negative)">B- (Negative)</option>
                      <option value="O+ (Positive)">O+ (Positive)</option>
                      <option value="O- (Negative)">O- (Negative)</option>
                      <option value="AB+ (Positive)">AB+ (Positive)</option>
                      <option value="AB- (Negative)">AB- (Negative)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Academic & Departmental Enrollment */}
            <div className="pt-4 border-t border-[#c3c6d7]">
              <div className="flex items-center justify-between border-b border-[#dce9ff] pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#e5eeff] flex items-center justify-center text-[#004ac6] font-bold text-label-sm">
                    02
                  </div>
                  <h2 className="text-headline-sm font-semibold text-[#0b1c30]">Academic &amp; Departmental Enrollment</h2>
                </div>
                <span className="text-label-xs uppercase tracking-wider text-[#737686]">Deanery Allocation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {/* Department / School */}
                <div>
                  <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5" htmlFor="department">
                    Department / School <span className="text-[#ba1a1a] font-bold">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="department"
                      value={formData.department}
                      onChange={e => handleChange('department', e.target.value)}
                      className="w-full h-10 px-3.5 bg-white border border-[#c3c6d7] rounded-md text-body-md text-[#0b1c30] focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] focus:outline-none appearance-none pr-9 transition-colors"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-2.5 text-[#434655] pointer-events-none">
                      <Icon name="expand_more" size={20} />
                    </span>
                  </div>
                  <p className="text-body-sm text-[#434655] mt-1">Allocates laboratory access and batch roster.</p>
                </div>

                {/* Academic Program & Degree */}
                <div>
                  <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5" htmlFor="degree">
                    Academic Program &amp; Degree <span className="text-[#ba1a1a] font-bold">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="degree"
                      value={formData.degree}
                      onChange={e => handleChange('degree', e.target.value)}
                      className="w-full h-10 px-3.5 bg-white border border-[#c3c6d7] rounded-md text-body-md text-[#0b1c30] focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] focus:outline-none appearance-none pr-9 transition-colors"
                    >
                      <option value="btech">B.Tech (Bachelor of Technology)</option>
                      <option value="mtech">M.Tech (Master of Technology)</option>
                      <option value="dual">Dual Degree (B.Tech + M.Tech)</option>
                      <option value="phd">Doctor of Philosophy (Ph.D.)</option>
                    </select>
                    <span className="absolute right-3 top-2.5 text-[#434655] pointer-events-none">
                      <Icon name="expand_more" size={20} />
                    </span>
                  </div>
                  <p className="text-body-sm text-[#434655] mt-1">Determines graduation requirement catalog.</p>
                </div>

                {/* Admission Academic Year */}
                <div>
                  <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5" htmlFor="academicYear">
                    Admission Academic Year <span className="text-[#ba1a1a] font-bold">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={e => handleChange('academicYear', e.target.value)}
                      className="w-full h-10 px-3.5 bg-white border border-[#c3c6d7] rounded-md text-body-md text-[#0b1c30] focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] focus:outline-none appearance-none pr-9 transition-colors"
                    >
                      {ACADEMIC_YEARS.map(yr => (
                        <option key={yr.value} value={yr.value}>
                          {yr.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-2.5 text-[#434655] pointer-events-none">
                      <Icon name="expand_more" size={20} />
                    </span>
                  </div>
                  <p className="text-body-sm text-[#434655] mt-1">Matriculation term: Autumn 2024</p>
                </div>

                {/* Assigned Faculty Advisor */}
                <div className="sm:col-span-2">
                  <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5" htmlFor="facultyAdvisor">
                    Assigned Faculty Mentor / Advisor
                  </label>
                  <div className="relative">
                    <select
                      id="facultyAdvisor"
                      value={formData.facultyAdvisor}
                      onChange={e => handleChange('facultyAdvisor', e.target.value)}
                      className="w-full h-10 px-3.5 bg-white border border-[#c3c6d7] rounded-md text-body-md text-[#0b1c30] focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] focus:outline-none appearance-none pr-9 transition-colors"
                    >
                      {FACULTY_ADVISORS.map(adv => (
                        <option key={adv} value={adv}>
                          {adv}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-2.5 text-[#434655] pointer-events-none">
                      <Icon name="expand_more" size={20} />
                    </span>
                  </div>
                  <p className="text-body-sm text-[#434655] mt-1">Advisor will review course prerequisites &amp; semester audits.</p>
                </div>

                {/* Enrollment Status */}
                <div>
                  <label className="block text-label-sm font-semibold text-[#0b1c30] mb-1.5">
                    Initial Enrollment Status <span className="text-[#ba1a1a] font-bold">*</span>
                  </label>
                  <div className="space-y-2 mt-2">
                    <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${formData.status === 'active' ? 'border-[#004ac6] bg-[#dce9ff]/40' : 'border-[#c3c6d7] bg-white hover:bg-[#eff4ff]'}`}>
                      <input
                        type="radio"
                        name="enrollment_status"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={() => handleChange('status', 'active')}
                        className="w-4 h-4 text-[#2563eb] focus:ring-[#004ac6] border-[#c3c6d7]"
                      />
                      <span className="flex items-center gap-1.5 text-label-sm text-[#0b1c30] font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#006c49]"></span> Active Student
                      </span>
                    </label>

                    <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${formData.status === 'on_leave' ? 'border-[#004ac6] bg-[#dce9ff]/40' : 'border-[#c3c6d7] bg-white hover:bg-[#eff4ff]'}`}>
                      <input
                        type="radio"
                        name="enrollment_status"
                        value="on_leave"
                        checked={formData.status === 'on_leave'}
                        onChange={() => handleChange('status', 'on_leave')}
                        className="w-4 h-4 text-[#2563eb] focus:ring-[#004ac6] border-[#c3c6d7]"
                      />
                      <span className="flex items-center gap-1.5 text-label-sm text-[#0b1c30]">
                        <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Provisional / On Leave
                      </span>
                    </label>

                    <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${formData.status === 'suspended' ? 'border-[#004ac6] bg-[#dce9ff]/40' : 'border-[#c3c6d7] bg-white hover:bg-[#eff4ff]'}`}>
                      <input
                        type="radio"
                        name="enrollment_status"
                        value="suspended"
                        checked={formData.status === 'suspended'}
                        onChange={() => handleChange('status', 'suspended')}
                        className="w-4 h-4 text-[#2563eb] focus:ring-[#004ac6] border-[#c3c6d7]"
                      />
                      <span className="flex items-center gap-1.5 text-label-sm text-[#0b1c30]">
                        <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span> Academic Hold
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Notice Card */}
            {!dismissWarning && (
              <div className="bg-[#ffdad6]/20 border border-[#ba1a1a]/20 rounded-xl p-4 flex items-start gap-3">
                <Icon name="verified_user" size={22} className="text-[#ba1a1a] mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-label-md font-bold text-[#93000a]">
                    Pre-registration Verification Check: Institutional Integrity
                  </h4>
                  <p className="text-body-sm text-[#434655] mt-0.5">
                    Ensure student produces original 12th Board marksheet during physical document verification before provisional status converts to degree award track.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissWarning(true)}
                  className="text-[#737686] hover:text-[#0b1c30] text-xs font-semibold uppercase tracking-wider"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Action Bar at Bottom */}
          <div className="bg-[#eff4ff] border-t border-[#c3c6d7] px-4 sm:px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#434655] text-label-sm">
              <Icon name="info" size={18} />
              <span>Created student profile will instantly provision campus Wi-Fi &amp; library catalog card.</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => navigate('/students')}
                className="text-label-md text-[#434655] hover:text-[#0b1c30] h-10 px-4 inline-flex items-center justify-center transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setToast({ message: 'Draft saved locally to browser storage.', type: 'info' })}
                className="btn-secondary"
                style={{ height: 40 }}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2"
                style={{ height: 40 }}
              >
                <Icon name="person_add" size={20} />
                <span>{loading ? 'Registering...' : '+ Register & Create Student Record'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-label-xs text-[#434655] text-center sm:text-left">
          <span>Apex University Administrative ERP • Release 4.8.2</span>
          <span>Secure Session Connected: Dr. Rajesh Sharma (ID: REG-8012)</span>
        </footer>
      </main>
    </>
  );
}
