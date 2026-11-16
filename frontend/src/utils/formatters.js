import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function formatEmailDate(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  } catch {
    return '';
  }
}

export function formatFullDate(date) {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  } catch {
    return '';
  }
}

export function getInitials(name) {
  return (
    name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

export function getAvatarColor(name) {
  const colors = ['#4F7CFF', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#059669', '#EA580C'];
  let hash = 0;
  for (let c of name || '') hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function truncate(str, n = 100) {
  return str?.length > n ? str.slice(0, n) + '...' : str;
}
