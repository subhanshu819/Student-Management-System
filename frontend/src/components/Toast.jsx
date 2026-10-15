import { useEffect } from 'react';
import Icon from './Icon.jsx';

/**
 * Toast notification component.
 * Props: message, type ('success'|'error'|'info'), onDismiss
 */
export default function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const configs = {
    success: { bg: '#ECFDF5', border: '#10B981', text: '#065F46', icon: 'check_circle' },
    error: { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', icon: 'error' },
    info: { bg: '#eff4ff', border: '#2563eb', text: '#004ac6', icon: 'info' },
    warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', icon: 'warning' },
  };
  const cfg = configs[type] || configs.info;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg modal-enter max-w-sm"
      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <Icon name={cfg.icon} size={20} filled className="" style={{ color: cfg.border }} />
      <span className="text-body-sm flex-1" style={{ color: cfg.text }}>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 hover:opacity-70 transition-opacity flex-shrink-0"
        style={{ color: cfg.text }}
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
