import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Archive,
  Mail,
  MailOpen,
  ChevronRight,
} from 'lucide-react';
import { conversationService } from '../../services/conversationService';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../hooks/useAuth';
import MessageBubble from '../../components/email/MessageBubble';
import ReplyComposer from '../../components/email/ReplyComposer';
import AIAnalysisPanel from '../../components/email/AIAnalysisPanel';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function ConversationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchConversation = async () => {
    try {
      setIsLoading(true);
      const res = await conversationService.getConversation(id);
      const data = res?.conversation || res?.data || res;
      setConversation(data);
      setMessages(data.messages || res.messages || []);
      setAnalysis(data.aiAnalysis || res.aiAnalysis || null);

      // Auto mark as read if not already read
      if (!data.isRead) {
        conversationService.updateConversation(id, { isRead: true }).catch(() => {});
      }
    } catch (err) {
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, [id]);

  const handleToggleStar = async () => {
    if (!conversation) return;
    try {
      const nextStar = !conversation.isImportant;
      await conversationService.updateConversation(id, { isImportant: nextStar });
      setConversation((prev) => ({ ...prev, isImportant: nextStar }));
      toast.success(nextStar ? 'Starred' : 'Unstarred');
    } catch {
      toast.error('Failed to update importance');
    }
  };

  const handleToggleArchive = async () => {
    try {
      await conversationService.updateConversation(id, { isArchived: true });
      toast.success('Conversation archived');
      navigate('/assistant/inbox');
    } catch {
      toast.error('Failed to archive');
    }
  };

  const handleToggleRead = async () => {
    if (!conversation) return;
    try {
      const nextRead = !conversation.isRead;
      await conversationService.updateConversation(id, { isRead: nextRead });
      setConversation((prev) => ({ ...prev, isRead: nextRead }));
      toast.success(nextRead ? 'Marked as read' : 'Marked as unread');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleChangeClassification = async (newClass) => {
    try {
      await conversationService.updateConversation(id, { manualClassification: newClass });
      setConversation((prev) => ({ ...prev, manualClassification: newClass }));
      setAnalysis((prev) => (prev ? { ...prev, classification: newClass } : { classification: newClass }));
      toast.success(`Classification changed to ${newClass}`);
    } catch {
      toast.error('Failed to update classification');
    }
  };

  const handleRegenerateAnalysis = async () => {
    try {
      setIsAiLoading(true);
      const res = await aiService.classify(id);
      const newAnalysis = res?.data?.analysis || res?.data || res;
      setAnalysis(newAnalysis);
      toast.success('AI analysis regenerated!');
    } catch {
      toast.error('Failed to re-analyze conversation');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton width={200} height={24} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <Skeleton height={400} />
          <Skeleton height={400} />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Conversation not found.</p>
        <Link to="/assistant/inbox">Back to Inbox</Link>
      </div>
    );
  }

  const primaryRecipient = conversation.participants?.[0]?.email || 'recipient@example.com';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Breadcrumb & Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-m)' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-b)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <Link to="/assistant/dashboard" style={{ color: 'var(--text-m)' }}>Dashboard</Link>
          <ChevronRight size={14} />
          <Link to="/assistant/inbox" style={{ color: 'var(--text-m)' }}>Inbox</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-h)', fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {conversation.subject || 'Conversation'}
          </span>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleToggleStar}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: conversation.isImportant ? 'var(--warning)' : 'var(--text-b)',
            }}
          >
            <Star size={15} fill={conversation.isImportant ? 'var(--warning)' : 'none'} />
            {conversation.isImportant ? 'Starred' : 'Star'}
          </button>

          <button
            onClick={handleToggleRead}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--text-b)',
            }}
          >
            {conversation.isRead ? <Mail size={15} /> : <MailOpen size={15} />}
            {conversation.isRead ? 'Mark Unread' : 'Mark Read'}
          </button>

          <button
            onClick={handleToggleArchive}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--text-b)',
            }}
          >
            <Archive size={15} />
            Archive
          </button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
        className="conversation-layout"
      >
        {/* Left Column: Messages Thread & ReplyComposer */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Thread Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-h)', margin: '0 0 10px 0' }}>
              {conversation.subject || '(No Subject)'}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-m)' }}>Participants:</span>
              {(conversation.participants || []).map((p, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '12px',
                    backgroundColor: 'var(--bg)',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    border: '1px solid var(--border)',
                    color: 'var(--text-b)',
                  }}
                >
                  {p.name ? `${p.name} <${p.email}>` : p.email}
                </span>
              ))}
            </div>
          </div>

          {/* Messages list */}
          <div style={{ padding: '24px', minHeight: '300px', maxHeight: '550px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <p style={{ color: 'var(--text-m)', textAlign: 'center' }}>No messages in thread.</p>
            ) : (
              messages.map((msg, i) => (
                <MessageBubble
                  key={msg._id || i}
                  message={msg}
                  isOwn={msg.fromEmail === user?.email}
                />
              ))
            )}
          </div>

          {/* Reply composer */}
          <ReplyComposer
            conversationId={id}
            recipientEmail={primaryRecipient}
            subject={`Re: ${conversation.subject || ''}`}
            onReplySent={fetchConversation}
          />
        </div>

        {/* Right Column: AI Analysis Panel */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            position: 'sticky',
            top: '84px',
          }}
        >
          <AIAnalysisPanel
            analysis={analysis}
            isLoading={isAiLoading}
            onRegenerate={handleRegenerateAnalysis}
            onChangeClassification={handleChangeClassification}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .conversation-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
