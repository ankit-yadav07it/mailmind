import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import EmailRow from './EmailRow';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';

export default function EmailList({
  conversations = [],
  isLoading = false,
  hasNextPage = false,
  onLoadMore,
  onToggleStar,
  onToggleArchive,
  onToggleRead,
  emptyTitle = 'No conversations found',
  emptyDescription = 'You do not have any emails matching this view.',
}) {
  const navigate = useNavigate();

  if (isLoading && conversations.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              borderBottom: idx < 5 ? '1px solid var(--border)' : 'none',
            }}
          >
            <Skeleton width={32} height={32} circle />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Skeleton width={120} height={14} />
                <Skeleton width={200} height={14} />
              </div>
              <Skeleton width="80%" height={12} />
            </div>
            <Skeleton width={60} height={14} />
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && conversations.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <EmptyState
          icon={<Mail size={40} color="var(--text-m)" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div>
        {conversations.map((conv) => (
          <EmailRow
            key={conv._id}
            conversation={conv}
            onClick={() => navigate(`/assistant/conversations/${conv._id}`)}
            onToggleStar={onToggleStar}
            onToggleArchive={onToggleArchive}
            onToggleRead={onToggleRead}
          />
        ))}
      </div>

      {hasNextPage && (
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border)' }}>
          <Button variant="secondary" onClick={onLoadMore} loading={isLoading}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
