import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserCheck, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { clientService } from '../../services/clientService';
import { formatEmailDate } from '../../utils/formatters';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ClientDashboard() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const navigate = useNavigate();

  const fetchAttentionList = async () => {
    try {
      setIsLoading(true);
      const res = await clientService.getAttention();
      const list = res?.data?.conversations || res?.data || (Array.isArray(res) ? res : []);
      // Sort HIGH priority first
      const priorityWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const sorted = [...list].sort(
        (a, b) => (priorityWeights[b.priority] || 2) - (priorityWeights[a.priority] || 2)
      );
      setConversations(sorted);
    } catch {
      toast.error('Failed to load attention items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttentionList();
  }, []);

  const handleMarkHandled = async (id, e) => {
    e.stopPropagation();
    try {
      setActionLoading((prev) => ({ ...prev, [id]: 'handled' }));
      await clientService.markHandled(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      toast.success('Conversation marked as handled');
    } catch {
      toast.error('Failed to mark conversation handled');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleTakeOver = async (id, e) => {
    e.stopPropagation();
    try {
      setActionLoading((prev) => ({ ...prev, [id]: 'takeover' }));
      await clientService.takeOver(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      toast.success('Delegated to your personal assistant');
    } catch {
      toast.error('Failed to reassign to assistant');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-h)', margin: 0 }}>
              Emails Requiring Your Attention
            </h1>
            {!isLoading && (
              <span
                style={{
                  backgroundColor: conversations.length > 0 ? 'var(--warning-lt)' : 'var(--success-lt)',
                  color: conversations.length > 0 ? 'var(--warning)' : 'var(--success)',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '2px 10px',
                  borderRadius: '100px',
                }}
              >
                {conversations.length}
              </span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-m)', marginTop: '4px', margin: 0 }}>
            Triaged by your assistant & AI because they require your personal decision or input.
          </p>
        </div>
      </div>

      {/* Main Attention List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '24px',
              }}
            >
              <Skeleton width="60%" height={24} />
              <div style={{ marginTop: '12px' }}>
                <Skeleton width="100%" height={60} />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: '40px',
          }}
        >
          <EmptyState
            icon="🎉"
            title="You're all caught up!"
            description="Nothing requires your attention right now. Your assistant is handling ongoing communications."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {conversations.map((item) => {
            const senderName = item.participants?.[0]?.name || item.participants?.[0]?.email || 'Counterparty';
            const reason = item.aiAnalysis?.reason || 'Requires personal approval or decision';
            const summary = item.aiAnalysis?.summary || item.snippet || 'No preview summary available.';

            return (
              <Card
                key={item._id}
                hover
                onClick={() => navigate(`/client/conversations/${item._id}`)}
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  borderLeft: item.priority === 'HIGH' ? '4px solid var(--danger)' : '4px solid var(--warning)',
                }}
              >
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar name={senderName} size="md" />
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-h)' }}>
                        {item.subject || '(No Subject)'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-m)' }}>
                        From: <strong>{senderName}</strong> • {formatEmailDate(item.lastMessageAt)}
                      </div>
                    </div>
                  </div>

                  {item.priority && (
                    <Badge variant={item.priority} size="sm">
                      {item.priority} Priority
                    </Badge>
                  )}
                </div>

                {/* AI Why you box */}
                <div
                  style={{
                    backgroundColor: 'var(--accent-lt)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    borderLeft: '3px solid var(--accent)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <Sparkles size={16} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase' }}>
                      Why your attention is needed:
                    </span>
                    <p style={{ fontSize: '13px', color: 'var(--text-b)', margin: '2px 0 0 0', lineHeight: 1.5 }}>
                      {reason}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <p style={{ fontSize: '14px', color: 'var(--text-b)', lineHeight: 1.6, margin: 0 }}>
                  {summary}
                </p>

                {/* Action Buttons */}
                <div
                  className="client-card-actions"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<UserCheck size={15} />}
                    loading={actionLoading[item._id] === 'takeover'}
                    onClick={(e) => handleTakeOver(item._id, e)}
                  >
                    Let Assistant Handle
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    icon={<CheckCircle2 size={15} />}
                    loading={actionLoading[item._id] === 'handled'}
                    onClick={(e) => handleMarkHandled(item._id, e)}
                  >
                    Mark as Handled
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 480px) {
          .client-card-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .client-card-actions button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
