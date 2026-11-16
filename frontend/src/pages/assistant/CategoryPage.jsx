import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Reply,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Star,
  HelpCircle,
} from 'lucide-react';
import { conversationService } from '../../services/conversationService';
import EmailList from '../../components/email/EmailList';
import toast from 'react-hot-toast';

const CATEGORY_INFO = {
  ASSISTANT_TO_REPLY: {
    title: 'Assistant to Reply',
    description: 'Emails and requests you need to actively draft and respond to.',
    icon: Reply,
    color: '#4F7CFF',
  },
  CLIENT_TO_REPLY: {
    title: 'Client to Reply',
    description: 'High-context emails requiring your client’s personal approval or decision.',
    icon: User,
    color: '#D97706',
  },
  NO_REPLY_NEEDED: {
    title: 'No Reply Needed',
    description: 'Informational announcements, confirmations, and newsletters.',
    icon: CheckCircle,
    color: '#6B7280',
  },
  action_required: {
    title: 'Action Required',
    description: 'Emails flagged by AI or manual rules as demanding explicit follow-up.',
    icon: AlertCircle,
    color: '#DC2626',
  },
  waiting: {
    title: 'Waiting for Response',
    description: 'Threads waiting on external counterparties to reply.',
    icon: Clock,
    color: '#D97706',
  },
  meetings: {
    title: 'Meetings & Appointments',
    description: 'Conversations with extracted calendar invites, scheduling polls, or agendas.',
    icon: Calendar,
    color: '#4F7CFF',
  },
  important: {
    title: 'Important & Starred',
    description: 'Priority conversations flagged for immediate attention.',
    icon: Star,
    color: '#F59E0B',
  },
  NEEDS_REVIEW: {
    title: 'Needs Review',
    description: 'Ambiguous threads where AI confidence fell below the auto-dispatch threshold.',
    icon: HelpCircle,
    color: '#EA580C',
  },
};

export default function CategoryPage() {
  const { category } = useParams();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const info = CATEGORY_INFO[category] || {
    title: category || 'Category',
    description: 'Filtered inbox view',
    icon: HelpCircle,
    color: 'var(--accent)',
  };

  const Icon = info.icon;

  const fetchCategoryEmails = async () => {
    try {
      setIsLoading(true);
      const res = await conversationService.getConversations({ category });
      const list = res?.data?.conversations || res?.conversations || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setConversations(list);
    } catch (err) {
      toast.error('Failed to load category conversations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryEmails();
  }, [category]);

  const handleToggleStar = async (id, isImportant) => {
    try {
      await conversationService.updateConversation(id, { isImportant });
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isImportant } : c))
      );
      toast.success(isImportant ? 'Starred' : 'Unstarred');
    } catch {
      toast.error('Failed to update email');
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      await conversationService.updateConversation(id, { isArchived: true });
      setConversations((prev) => prev.filter((c) => c._id !== id));
      toast.success('Archived');
    } catch {
      toast.error('Failed to archive email');
    }
  };

  const handleToggleRead = async (id, isRead) => {
    try {
      await conversationService.updateConversation(id, { isRead });
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isRead } : c))
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Category banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--surface)',
          padding: '24px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          borderLeft: `5px solid ${info.color}`,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: `${info.color}15`,
            color: info.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-h)', margin: 0 }}>
            {info.title}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-m)', marginTop: '4px', margin: 0 }}>
            {info.description}
          </p>
        </div>
      </div>

      {/* List */}
      <EmailList
        conversations={conversations}
        isLoading={isLoading}
        onToggleStar={handleToggleStar}
        onToggleArchive={handleToggleArchive}
        onToggleRead={handleToggleRead}
        emptyTitle={`No conversations in ${info.title}`}
        emptyDescription="All threads in this category have been triaged or handled."
      />
    </div>
  );
}
