import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, UserCheck, Calendar } from 'lucide-react';
import { conversationService } from '../../services/conversationService';
import { clientService } from '../../services/clientService';
import MessageBubble from '../../components/email/MessageBubble';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function ClientConversation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchConv = async () => {
      try {
        setIsLoading(true);
        const res = await conversationService.getConversation(id);
        const data = res?.conversation || res?.data || res;
        setConversation(data);
        setMessages(data.messages || res.messages || []);
        setAnalysis(data.aiAnalysis || res.aiAnalysis || null);
      } catch {
        toast.error('Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConv();
  }, [id]);

  const handleMarkHandled = async () => {
    try {
      setActionLoading('handled');
      await clientService.markHandled(id);
      toast.success('Marked as handled');
      navigate('/client/dashboard');
    } catch {
      toast.error('Failed to update conversation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTakeOver = async () => {
    try {
      setActionLoading('takeover');
      await clientService.takeOver(id);
      toast.success('Delegated to assistant');
      navigate('/client/dashboard');
    } catch {
      toast.error('Failed to update conversation');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton width={180} height={24} />
        <Skeleton height={80} />
        <Skeleton height={200} />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Conversation not found.</p>
        <Button variant="ghost" onClick={() => navigate('/client/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/client/dashboard')}
        >
          Back to Attention Queue
        </Button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            icon={<UserCheck size={16} />}
            loading={actionLoading === 'takeover'}
            onClick={handleTakeOver}
          >
            Let Assistant Handle
          </Button>
          <Button
            variant="success"
            icon={<CheckCircle2 size={16} />}
            loading={actionLoading === 'handled'}
            onClick={handleMarkHandled}
          >
            Mark as Handled
          </Button>
        </div>
      </div>

      {/* Main card */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Title */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-h)', margin: '0 0 8px 0' }}>
            {conversation.subject || '(No Subject)'}
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-m)' }}>
            Participants: {(conversation.participants || []).map((p) => p.name || p.email).join(', ')}
          </div>
        </div>

        {/* AI Summary Highlight Box */}
        {analysis?.summary && (
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: 'var(--accent-lt)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <Sparkles size={18} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase' }}>
                AI Executive Summary:
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-b)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                {analysis.summary}
              </p>
              {analysis.reason && (
                <div style={{ fontSize: '12px', color: 'var(--text-m)', marginTop: '6px' }}>
                  <strong>Why you:</strong> {analysis.reason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div style={{ padding: '24px', minHeight: '300px' }}>
          {messages.length === 0 ? (
            <p style={{ color: 'var(--text-m)', textAlign: 'center' }}>No messages available in this thread.</p>
          ) : (
            messages.map((msg, i) => (
              <MessageBubble
                key={msg._id || i}
                message={msg}
                isOwn={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
