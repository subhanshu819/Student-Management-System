import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

/**
 * Confirmation dialog with typed confirmation support.
 * Props:
 *  - isOpen: bool
 *  - onClose: fn
 *  - onConfirm: fn
 *  - student: object (the student to delete)
 */
export default function DeleteModal({ isOpen, onClose, onConfirm, student }) {
  const inputRef = useRef(null);
  const confirmWord = 'DELETE';

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen || !student) return null;

  function handleConfirm() {
    const val = inputRef.current?.value || '';
    if (val !== confirmWord) {
      inputRef.current?.classList.add('border-red-500');
      inputRef.current?.focus();
      return;
    }
    onConfirm(student.id);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(11,28,48,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl border border-[#c3c6d7] w-full max-w-lg mx-auto modal-enter overflow-hidden"
        style={{ boxShadow: '0 20px 25px -5px rgba(15,23,42,0.1), 0 8px 10px -6px rgba(15,23,42,0.06)' }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#ffdad6', color: '#ba1a1a' }}>
            <Icon name="warning" size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-headline-sm text-[#0b1c30]">Delete Student Record</h2>
            <p className="text-body-sm text-[#434655] mt-0.5">Permanent academic record removal protocol.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#4d556b] hover:text-[#0b1c30] hover:bg-[#e5eeff] transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4 flex flex-col gap-4">
          {/* Warning message */}
          <div className="p-3.5 rounded-xl text-body-sm text-[#0b1c30]"
            style={{ backgroundColor: 'rgba(255,218,214,0.35)', border: '1px solid rgba(186,26,26,0.2)' }}>
            Are you sure you want to delete{' '}
            <span className="font-bold text-[#ba1a1a]">{student.fullName}</span>{' '}
            (Roll No:{' '}
            <span className="font-mono font-semibold">{student.rollNumber}</span>
            )? This action will remove all academic transcripts, enrollment history, and portal access.{' '}
            <span className="font-semibold underline">This action cannot be undone.</span>
          </div>

          {/* Student summary */}
          <div className="flex items-center justify-between p-3 rounded-xl text-body-sm"
            style={{ backgroundColor: '#eff4ff', border: '1px solid #c3c6d7' }}>
            <div className="flex items-center gap-2">
              <Icon name="badge" size={18} className="text-[#4d556b]" />
              <span className="font-medium text-[#0b1c30]">Dept: {student.departmentLabel}</span>
            </div>
            <span className="text-[#4d556b] text-data-tabular">
              Semester {student.semester} • CGPA: {student.cgpa}
            </span>
          </div>

          {/* Confirm input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md text-[#0b1c30]">
              Type <span className="font-mono font-bold text-[#ba1a1a]">{confirmWord}</span> to confirm
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder={confirmWord}
              className="form-input uppercase tracking-widest font-mono"
              style={{ letterSpacing: '0.15em' }}
              onChange={e => {
                e.target.classList.remove('border-red-500');
              }}
            />
            <span className="text-label-xs text-[#434655]">
              Institutional audit logs will record Dr. Rajesh Sharma as the executing registrar.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#c3c6d7] flex items-center justify-end gap-3"
          style={{ backgroundColor: '#eff4ff' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-destructive" onClick={handleConfirm}>
            <Icon name="delete_forever" size={18} />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
