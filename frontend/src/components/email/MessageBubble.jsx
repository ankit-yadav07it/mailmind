import { format } from 'date-fns';
import Avatar from '../ui/Avatar';

export default function MessageBubble({ message, isOwn = false }) {
  const {
    fromName = 'Sender',
    fromEmail = '',
    body = '',
    timestamp,
  } = message;

  const formattedTime = timestamp ? (() => {
    try {
      return format(new Date(timestamp), 'MMM d, h:mm a');
    } catch {
      return '';
    }
  })() : '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '20px',
      }}
    >
      <Avatar name={fromName || fromEmail || 'User'} size="sm" />

      <div
        style={{
          maxWidth: '75%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            marginBottom: '4px',
            flexDirection: isOwn ? 'row-reverse' : 'row',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>
            {fromName || fromEmail}
          </span>
          {formattedTime && (
            <span style={{ fontSize: '11px', color: 'var(--text-m)' }}>
              {formattedTime}
            </span>
          )}
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            borderTopRightRadius: isOwn ? '2px' : 'var(--radius)',
            borderTopLeftRadius: !isOwn ? '2px' : 'var(--radius)',
            backgroundColor: isOwn ? 'var(--accent)' : 'var(--surface)',
            color: isOwn ? '#FFFFFF' : 'var(--text-b)',
            border: isOwn ? 'none' : '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            fontSize: '14px',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}
