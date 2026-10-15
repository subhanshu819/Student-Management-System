// Shared utility helpers

/**
 * Get badge class based on student status
 */
export function getStatusBadgeClass(status) {
  switch (status) {
    case 'active': return 'badge-active';
    case 'on_leave': return 'badge-warning';
    case 'suspended': return 'badge-error';
    case 'probation': return 'badge-warning';
    case 'graduated': return 'badge-active';
    default: return 'badge-warning';
  }
}

/**
 * Friendly label for status
 */
export function getStatusLabel(status) {
  switch (status) {
    case 'active': return 'Active';
    case 'on_leave': return 'On Leave';
    case 'suspended': return 'Suspended';
    case 'probation': return 'Academic Probation';
    case 'graduated': return 'Graduated';
    default: return status;
  }
}

/**
 * Returns color class for CGPA
 */
export function getCgpaColor(cgpa) {
  if (cgpa >= 9.0) return 'text-green-600';
  if (cgpa >= 7.5) return 'text-blue-700';
  if (cgpa >= 6.0) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Returns color class for attendance
 */
export function getAttendanceColor(pct) {
  if (pct >= 90) return 'text-green-600';
  if (pct >= 75) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Format date string
 */
export function formatDate(dateStr) {
  return dateStr || '—';
}

/**
 * Get department short code label
 */
export function getDeptLabel(deptValue, departments) {
  const dept = departments?.find(d => d.value === deptValue);
  return dept ? dept.label : deptValue;
}

/**
 * Generate avatar color for a student name
 */
export function getAvatarColors(name) {
  const palette = [
    { bg: '#dbe1ff', text: '#004ac6' },
    { bg: '#6ffbbe', text: '#006c49' },
    { bg: '#dae2fd', text: '#4d556b' },
    { bg: '#ffdad6', text: '#ba1a1a' },
    { bg: '#d3e4fe', text: '#213145' },
  ];
  const idx = (name?.charCodeAt(0) || 0) % palette.length;
  return palette[idx];
}
