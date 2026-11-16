const CLASSIFICATION_BADGES = {
  ASSISTANT_TO_REPLY: {
    bg: '#EEF2FF',
    color: '#3B68FF',
    border: '#C7D2FE',
    dot: '#4F7CFF',
    label: 'Assistant to Reply',
  },
  CLIENT_TO_REPLY: {
    bg: '#FFFBEB',
    color: '#B45309',
    border: '#FDE68A',
    dot: '#F59E0B',
    label: 'Client to Reply',
  },
  NO_REPLY_NEEDED: {
    bg: '#F8FAFC',
    color: '#64748B',
    border: '#E2E8F0',
    dot: '#94A3B8',
    label: 'No Reply Needed',
  },
  NEEDS_REVIEW: {
    bg: '#FFF7ED',
    color: '#C2410C',
    border: '#FFEDD5',
    dot: '#EA580C',
    label: 'Needs Review',
  },
};

const PRIORITY_BADGES = {
  HIGH: { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', dot: '#EF4444', label: 'High Priority' },
  MEDIUM: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', dot: '#F59E0B', label: 'Medium' },
  LOW: { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', dot: '#94A3B8', label: 'Low' },
};

export default function Badge({ variant, size = 'md', showDot = true, children }) {
  const style = CLASSIFICATION_BADGES[variant] || PRIORITY_BADGES[variant] || {
    bg: '#F8FAFC',
    color: '#64748B',
    border: '#E2E8F0',
    dot: '#94A3B8',
    label: variant,
  };

  const isSmall = size === 'sm';
  const fontSize = isSmall ? '11px' : '12px';
  const padding = isSmall ? '2px 8px' : '3px 10px';
  const dotSize = isSmall ? 5 : 6;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        borderRadius: '9999px',
        fontSize,
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        lineHeight: 1.3,
      }}
    >
      {showDot && (
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: style.dot,
            flexShrink: 0,
          }}
        />
      )}
      <span>{children || style.label}</span>
    </span>
  );
}
