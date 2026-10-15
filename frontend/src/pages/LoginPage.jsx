import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function validate() {
    const errs = {};
    if (!form.identifier.trim()) errs.identifier = 'College email or student ID is required.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 4) errs.password = 'Password must be at least 4 characters.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await auth.login(form.identifier, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#f8f9ff' }}
    >
      {/* Top bar */}
      <header className="w-full bg-white border-b border-[#c3c6d7] shadow-sm py-2 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#2563eb' }}>
            <Icon name="account_balance" size={20} filled className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-title-md text-[#0b1c30] leading-tight">Apex University</span>
            <span className="text-label-xs text-[#434655] uppercase tracking-wider">Office of the Registrar</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-label-sm text-[#434655] px-3 py-1 rounded-full border border-[#c3c6d7]"
            style={{ backgroundColor: '#eff4ff' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#006c49' }} />
            <span>Identity Service Online</span>
          </div>
          <a href="#" className="text-label-sm font-semibold text-[#004ac6] hover:underline flex items-center gap-1">
            Help &amp; Support
            <Icon name="open_in_new" size={14} />
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white border border-[#c3c6d7] rounded-2xl shadow-sm relative overflow-hidden p-6 sm:p-8">
            {/* Blue accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#2563eb' }} />

            {/* Icon + title */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
                style={{ backgroundColor: '#eff4ff', border: '1px solid #c3c6d7' }}>
                <Icon name="school" size={30} filled className="text-[#004ac6]" />
              </div>
              <h1 className="text-headline-md text-[#0b1c30]">Student &amp; Faculty Portal</h1>
              <p className="text-body-sm text-[#434655] mt-1">Sign in with your institutional credentials to continue</p>
            </div>

            {/* Info banner */}
            <div className="mb-6 rounded-xl p-3 flex items-start gap-3"
              style={{ backgroundColor: '#eff4ff', border: '1px solid #c3c6d7' }}>
              <Icon name="info" size={18} filled className="text-[#004ac6] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-label-sm font-semibold text-[#0b1c30]">Fall 2024 Enrollment Open</p>
                <p className="text-body-sm text-[#434655] mt-0.5">
                  Use your institutional ID (e.g.{' '}
                  <code className="font-mono text-[#0b1c30]">s10294</code>) or registered{' '}
                  <code className="font-mono text-[#0b1c30]">@apex.edu.in</code> email address.
                </p>
              </div>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
              {apiError && (
                <div className="p-3 rounded-xl text-body-sm text-[#991B1B]"
                  style={{ backgroundColor: '#FEF2F2', border: '1px solid #EF4444' }}>
                  {apiError}
                </div>
              )}

              {/* Identifier */}
              <div>
                <label htmlFor="identifier" className="block text-label-md font-semibold text-[#0b1c30] mb-1.5">
                  College Email or Student ID
                </label>
                <div className="relative">
                  <Icon name="badge" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
                  <input
                    id="identifier"
                    type="text"
                    placeholder="name@apex.edu.in or 8-digit ID"
                    value={form.identifier}
                    onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                    className={`form-input pl-9 ${errors.identifier ? 'error' : ''}`}
                    autoComplete="username"
                  />
                </div>
                {errors.identifier
                  ? <p className="mt-1 text-body-sm text-[#ba1a1a]">{errors.identifier}</p>
                  : <p className="mt-1 text-body-sm text-[#434655] flex items-center gap-1">
                      <Icon name="help_outline" size={13} />
                      For dual enrollment, use departmental primary ID.
                    </p>
                }
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-label-md font-semibold text-[#0b1c30]">Password</label>
                  <a href="#" className="text-label-sm font-semibold text-[#004ac6] hover:underline">Forgot Password?</a>
                </div>
                <div className="relative">
                  <Icon name="lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your security password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className={`form-input pl-9 pr-10 ${errors.password ? 'error' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#0b1c30] transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-body-sm text-[#ba1a1a]">{errors.password}</p>}
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                  className="w-4 h-4 rounded border-[#c3c6d7] accent-[#2563eb] cursor-pointer"
                />
                <span className="text-label-sm text-[#434655]">Remember me for 30 days</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-11 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: 15 }}
              >
                {loading ? (
                  <><Icon name="hourglass_empty" size={18} /><span>Signing in...</span></>
                ) : (
                  <><Icon name="login" size={18} /><span>Sign In to Dashboard</span></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#c3c6d7]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-label-xs text-[#434655] uppercase tracking-wider">
                  New Admissions &amp; Registration
                </span>
              </div>
            </div>

            {/* Registration link */}
            <div className="text-center">
              <p className="text-body-md text-[#434655]">
                Don't have an active account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-[#004ac6] hover:underline inline-flex items-center gap-0.5 ml-1"
                >
                  New student registration
                  <Icon name="arrow_forward" size={14} />
                </Link>
              </p>
            </div>

            {/* Security footer */}
            <div className="mt-6 pt-4 border-t border-[#c3c6d7] flex items-center justify-center gap-4 text-[#434655]">
              <div className="flex items-center gap-1 text-label-xs font-semibold" style={{ color: '#006c49' }}>
                <Icon name="verified_user" size={14} filled />
                <span>256-bit SSL Academic Encryption</span>
              </div>
              <span className="text-[#c3c6d7]">•</span>
              <span className="text-label-xs text-[#737686]">FERPA Compliant</span>
            </div>
          </div>

          {/* External help */}
          <p className="mt-4 text-center text-body-sm text-[#434655]">
            Need access assistance? Contact the IT Helpdesk at{' '}
            <a href="mailto:support@apex.edu.in" className="text-[#004ac6] hover:underline font-medium">
              support@apex.edu.in
            </a>{' '}
            or call Ext. 4090.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#c3c6d7] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-label-sm text-[#434655]">© 2024 Apex University. All rights reserved.</span>
            <span className="hidden sm:inline text-[#c3c6d7]">|</span>
            <span className="hidden sm:inline text-label-sm font-semibold text-[#004ac6]">Academic Year 2024–25</span>
          </div>
          <div className="flex items-center gap-4 text-label-sm text-[#434655]">
            <a href="#" className="hover:text-[#004ac6] hover:underline">Privacy Policy</a>
            <span className="text-[#c3c6d7]">•</span>
            <a href="#" className="hover:text-[#004ac6] hover:underline">Acceptable Use Policy</a>
            <span className="text-[#c3c6d7]">•</span>
            <a href="#" className="hover:text-[#004ac6] hover:underline">Campus Portal Directory</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
