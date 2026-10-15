import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { DEPARTMENTS } from '../data/mockData.js';

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Contains special character', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#EF4444', '#F59E0B', '#2563eb', '#10B981'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : '#c3c6d7' }} />
        ))}
      </div>
      {password && (
        <p className="text-label-xs" style={{ color: colors[score] || '#434655' }}>
          {labels[score] || ''}
          {score === 4 && ' — Contains uppercase, numeral, and standard special character'}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({
    fullName: '', rollNumber: '', email: '', department: '', password: '', confirmPassword: '', agree: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full legal name is required.';
    if (!form.rollNumber.trim()) errs.rollNumber = 'Student roll / enrolment number is required.';
    if (!form.email.trim()) errs.email = 'Institutional email ID is required.';
    else if (!form.email.endsWith('@apex.edu.in')) errs.email = 'Email must end with @apex.edu.in';
    if (!form.department) errs.department = 'Please select your academic department.';
    if (!form.password) errs.password = 'Please create a portal password.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!form.agree) errs.agree = 'You must accept the Academic Honor Code to proceed.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await auth.register(form);
      setSuccess(true);
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f9ff' }}>
        <div className="bg-white border border-[#c3c6d7] rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#ECFDF5' }}>
            <Icon name="check_circle" size={36} filled className="text-[#10B981]" />
          </div>
          <h1 className="text-headline-sm text-[#0b1c30] mb-2">Registration Submitted</h1>
          <p className="text-body-md text-[#434655] mb-6">
            Your registration is pending registrar verification. You will receive a confirmation at{' '}
            <strong>{form.email}</strong>.
          </p>
          <Link to="/login" className="btn-primary w-full justify-center">
            <Icon name="login" size={18} />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9ff' }}>
      {/* Header */}
      <header className="w-full bg-white border-b border-[#c3c6d7] py-2 px-4 sm:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#2563eb' }}>
            <Icon name="account_balance" size={20} filled className="text-white" />
          </div>
          <div>
            <span className="text-title-md text-[#0b1c30]">Apex University</span>
            <span className="text-label-xs text-[#434655] uppercase tracking-wider block">Office of the Registrar</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-label-sm text-[#006c49]">
            <Icon name="verified_user" size={14} filled />
            <span>Secure Institutional Gateway</span>
          </div>
          <a href="#" className="text-label-sm font-semibold text-[#004ac6] hover:underline flex items-center gap-1">
            Help Desk <Icon name="help_outline" size={14} />
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg">
          <div className="bg-white border border-[#c3c6d7] rounded-2xl shadow-sm p-6 sm:p-8">
            {/* Icon + title */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"
                style={{ backgroundColor: '#eff4ff', border: '1px solid #c3c6d7' }}>
                <Icon name="account_balance" size={28} filled className="text-[#004ac6]" />
              </div>
              <h1 className="text-headline-md text-[#0b1c30]">Student Portal Registration</h1>
              <p className="text-body-sm text-[#434655] mt-1">Create your authenticated portal account for academic access</p>
              <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-xs text-[#004ac6] border border-[#2563eb]"
                style={{ backgroundColor: '#eff4ff' }}>
                <Icon name="info" size={13} />
                Requires active enrollment verification for AY 2024-25
              </span>
            </div>

            {errors.api && (
              <div className="mb-4 p-3 rounded-xl text-body-sm text-[#991B1B]"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #EF4444' }}>
                {errors.api}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
              {/* Row 1: Name + Roll */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-semibold text-[#0b1c30] mb-1.5">
                    Full Legal Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={form.fullName}
                    onChange={set('fullName')}
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                  />
                  {errors.fullName && <p className="mt-1 text-body-sm text-[#ba1a1a]">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-label-md font-semibold text-[#0b1c30] mb-1.5">
                    Student Roll / Enrolment No. <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="E.G. 24CS1049"
                    value={form.rollNumber}
                    onChange={set('rollNumber')}
                    className={`form-input font-mono ${errors.rollNumber ? 'error' : ''}`}
                  />
                  {errors.rollNumber
                    ? <p className="mt-1 text-body-sm text-[#ba1a1a]">{errors.rollNumber}</p>
                    : <p className="mt-1 text-body-sm text-[#434655]">Printed on your provisional admission slip</p>
                  }
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-label-md font-semibold text-[#0b1c30] mb-1.5">
                  Institutional Email ID <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <Icon name="mail" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
                  <input
                    type="email"
                    placeholder="e.g. rollno@apex.edu.in"
                    value={form.email}
                    onChange={set('email')}
                    className={`form-input pl-9 ${errors.email ? 'error' : ''}`}
                  />
                </div>
                {errors.email
                  ? <p className="mt-1 text-body-sm text-[#ba1a1a]">{errors.email}</p>
                  : <p className="mt-1 text-body-sm text-[#434655]">
                      Must end in institutional domain{' '}
                      <span className="font-semibold text-[#004ac6]">@apex.edu.in</span>
                    </p>
                }
              </div>

              {/* Department */}
              <div>
                <label className="block text-label-md font-semibold text-[#0b1c30] mb-1.5">
                  Academic Department <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.department}
                    onChange={set('department')}
                    className={`form-select ${errors.department ? 'error border-[#EF4444]' : ''}`}
                  >
                    <option value="">Select Department / Branch</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <Icon name="expand_more" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4d556b]" />
                </div>
                {errors.department && <p className="mt-1 text-body-sm text-[#ba1a1a]">{errors.department}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-label-md font-semibold text-[#0b1c30] mb-1.5">
                  Create Portal Password <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={set('password')}
                    className={`form-input pr-10 ${errors.password ? 'error' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#0b1c30]">
                    <Icon name={showPwd ? 'visibility_off' : 'visibility'} size={18} />
                  </button>
                </div>
                <PasswordStrength password={form.password} />
                {errors.password && <p className="mt-1 text-body-sm text-[#ba1a1a]">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-label-md font-semibold text-[#0b1c30] mb-1.5">
                  Confirm Password <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    className={`form-input pr-10 ${errors.confirmPassword ? 'error' : ''}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#0b1c30]">
                    <Icon name={showConfirm ? 'visibility_off' : 'visibility'} size={18} />
                  </button>
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <Icon name="check_circle" size={18} filled className="absolute right-10 top-1/2 -translate-y-1/2 text-[#10B981]" />
                  )}
                </div>
                {form.confirmPassword && form.password === form.confirmPassword && !errors.confirmPassword && (
                  <p className="mt-1 text-body-sm" style={{ color: '#10B981' }}>Passwords match correctly</p>
                )}
                {errors.confirmPassword && <p className="mt-1 text-body-sm text-[#ba1a1a]">{errors.confirmPassword}</p>}
              </div>

              {/* Honor code */}
              <div>
                <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer select-none
                  ${errors.agree ? 'border border-[#EF4444]' : 'border border-[#c3c6d7]'}`}
                  style={{ backgroundColor: '#eff4ff' }}>
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={set('agree')}
                    className="w-4 h-4 mt-0.5 rounded accent-[#2563eb] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-body-sm text-[#0b1c30]">
                    I hereby accept the{' '}
                    <a href="#" className="text-[#004ac6] font-semibold hover:underline">Apex University Academic Honor Code</a>,
                    Acceptable IT Policy, and certify that all enrollment credentials provided are accurate.
                  </span>
                </label>
                {errors.agree && <p className="mt-1 text-body-sm text-[#ba1a1a]">{errors.agree}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-11 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: 15 }}
              >
                {loading ? (
                  <><Icon name="hourglass_empty" size={18} /><span>Processing...</span></>
                ) : (
                  <><span>Complete Student Registration</span><Icon name="arrow_forward" size={18} /></>
                )}
              </button>

              {/* Back to login */}
              <p className="text-center text-body-md text-[#434655]">
                Already have an institutional account?{' '}
                <Link to="/login" className="font-semibold text-[#004ac6] hover:underline inline-flex items-center gap-0.5">
                  Log in here <Icon name="login" size={14} />
                </Link>
              </p>
            </form>
          </div>

          {/* Security badges */}
          <div className="mt-4 flex items-center justify-center gap-6 text-label-xs text-[#434655]">
            <div className="flex items-center gap-1.5">
              <Icon name="lock" size={14} />
              <span>256-bit SSL Enrolment Guard</span>
            </div>
            <span className="text-[#c3c6d7]">•</span>
            <span>NAAC Grade A++ Accredited</span>
            <span className="text-[#c3c6d7]">•</span>
            <span>AISHE Code: U-0129</span>
          </div>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-[#c3c6d7] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-label-sm text-[#434655]">
          <span>© 2024 Apex University. Directorate of Academic Admissions &amp; Records. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#004ac6] hover:underline">Privacy Charter</a>
            <span className="text-[#c3c6d7]">•</span>
            <a href="#" className="hover:text-[#004ac6] hover:underline">Honor Code Guidelines</a>
            <span className="text-[#c3c6d7]">•</span>
            <a href="#" className="hover:text-[#004ac6] hover:underline">Campus Registrar Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
