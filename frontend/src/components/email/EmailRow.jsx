import { useState } from 'react';
import { Star, Archive, MailOpen, Mail } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import Avatar from '../ui/Avatar';
import ClassificationBadge from './ClassificationBadge';
import Badge from '../ui/Badge';

export default function EmailRow({ conversation, onClick, onToggleStar, onToggleArchive, onToggleRead }) {
  const [hovered, setHovered] = useState(false);

  const {
    _id,
    subject = '(No Subject)',
    participants = [],
    lastMessageAt,
    isRead = false,
    isImportant = false,
    aiClassification,
    manualClassification,
    priority = 'MEDIUM',
    snippet = '',
  } = conversation;

  const classification = manualClassification || aiClassification;
  const primarySender = participants[0]?.name || participants[0]?.email || 'Unknown';

  const formatEmailDate = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isToday(d)) return format(d, 'h:mm a');
      if (isYesterday(d)) return 'Yesterday';
      return format(d, 'MMM d');
    } catch {
      return '';
    }
  };

  const borderLeftColor = !isRead 
    ? 'var(--accent)' 
    : priority === 'HIGH' 
      ? 'var(--danger)' 
      : 'transparent';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: !isRead ? '#F4F7FF' : hovered ? 'rgba(0, 0, 0, 0.02)' : 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        borderLeft: `4px solid ${borderLeftColor}`,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        gap: '12px',
        position: 'relative',
      }}
      className="email-row-item"
    >
      {/* Left: Avatar + unread dot */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Avatar name={primarySender} size="sm" />
        {!isRead && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              border: '2px solid white',
            }}
          />
        )}
      </div>

      {/* Middle: Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Top row */}
        <div className="email-row-header" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', overflow: 'hidden' }}>
          <span
            style={{
              fontWeight: !isRead ? 700 : 600,
              fontSize: '14px',
              color: 'var(--text-h)',
              whiteSpace: 'nowrap',
              maxWidth: '180px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            className="email-sender-text"
          >
            {primarySender}
          </span>
          <span
            style={{
              fontWeight: !isRead ? 600 : 400,
              fontSize: '14px',
              color: 'var(--text-h)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '320px',
            }}
            className="email-subject-text"
          >
            {subject}
          </span>
          <span
            style={{
              fontSize: '13px',
              color: 'var(--text-m)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
            className="email-snippet-text"
          >
            — {snippet || 'No preview available'}
          </span>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {classification && (
            <ClassificationBadge classification={classification} size="sm" />
          )}

          {priority && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor:
                    priority === 'HIGH' ? 'var(--danger)' : priority === 'MEDIUM' ? 'var(--warning)' : 'var(--text-m)',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-m)', textTransform: 'capitalize' }}>
                {priority.toLowerCase()}
              </span>
            </div>
          )}

          <span style={{ fontSize: '12px', color: 'var(--text-m)', marginLeft: 'auto' }}>
            {formatEmailDate(lastMessageAt)}
          </span>
        </div>
      </div>

      {/* Right: Hover Actions (desktop) */}
      <div
        className="email-row-actions"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar && onToggleStar(_id, !isImportant);
          }}
          title={isImportant ? 'Unstar' : 'Star'}
          style={{
            background: 'none',
            border: 'none',
            padding: 6,
            borderRadius: 4,
            cursor: 'pointer',
            color: isImportant ? 'var(--warning)' : 'var(--text-m)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Star size={16} fill={isImportant ? 'var(--warning)' : 'none'} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleRead && onToggleRead(_id, !isRead);
          }}
          title={isRead ? 'Mark as unread' : 'Mark as read'}
          style={{
            background: 'none',
            border: 'none',
            padding: 6,
            borderRadius: 4,
            cursor: 'pointer',
            color: 'var(--text-m)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isRead ? <Mail size={16} /> : <MailOpen size={16} />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleArchive && onToggleArchive(_id, true);
          }}
          title="Archive"
          style={{
            background: 'none',
            border: 'none',
            padding: 6,
            borderRadius: 4,
            cursor: 'pointer',
            color: 'var(--text-m)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Archive size={16} />
        </button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .email-row-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 2px !important;
          }
          .email-sender-text, .email-subject-text {
            max-width: 100% !important;
          }
          .email-snippet-text {
            display: none !important;
          }
          .email-row-actions {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
