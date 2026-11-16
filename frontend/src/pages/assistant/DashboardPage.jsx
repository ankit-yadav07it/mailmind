import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Mail,
  MailCheck,
  Star,
  AlertCircle,
  Reply,
  User,
  Calendar,
  Bell,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { conversationService } from '../../services/conversationService';
import { notificationService } from '../../services/notificationService';
import StatsCard from '../../components/dashboard/StatsCard';
import EmailList from '../../components/email/EmailList';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const navigate = useNavigate();

  const [recentConversations, setRecentConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  const fetchRecent = async () => {
    try {
      setConversationsLoading(true);
      const res = await conversationService.getConversations({ limit: 10, sort: 'newest' });
      const list = res?.data?.conversations || res?.conversations || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setRecentConversations(list);
    } catch (err) {
      console.error(err);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      setMeetingsLoading(true);
      const res = await conversationService.getConversations({ category: 'meetings', limit: 3 });
      const list = res?.data?.conversations || res?.conversations || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setUpcomingMeetings(list);
    } catch (err) {
      console.error(err);
    } finally {
      setMeetingsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await notificationService.getNotifications();
      const list = res?.data?.notifications || res?.data || (Array.isArray(res) ? res : []);
      setNotifications(list.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
    fetchMeetings();
    fetchNotifications();
  }, []);

  const handleToggleStar = async (id, isImportant) => {
    try {
      await conversationService.updateConversation(id, { isImportant });
      setRecentConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isImportant } : c))
      );
      toast.success(isImportant ? 'Starred' : 'Unstarred');
    } catch (err) {
      toast.error('Failed to update email');
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      await conversationService.updateConversation(id, { isArchived: true });
      setRecentConversations((prev) => prev.filter((c) => c._id !== id));
      toast.success('Conversation archived');
    } catch (err) {
      toast.error('Failed to archive email');
    }
  };

  const handleToggleRead = async (id, isRead) => {
    try {
      await conversationService.updateConversation(id, { isRead });
      setRecentConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isRead } : c))
      );
    } catch (err) {
      toast.error('Failed to update read status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-h)', margin: 0 }}>
            {greeting}, {user?.name || 'Assistant'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-m)', marginTop: '4px', margin: 0 }}>
            {currentDate} • Executive Inbox is synchronized
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            icon={<Sparkles size={15} />}
            onClick={() => navigate('/assistant/category/NEEDS_REVIEW')}
          >
            Review AI Queue
          </Button>
          <Button
            variant="primary"
            icon={<Mail size={15} />}
            onClick={() => navigate('/assistant/inbox')}
          >
            Open Inbox
          </Button>
        </div>
      </div>

      {/* 6 StatsCards responsive grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}
      >
        <StatsCard
          label="Total Emails"
          value={stats?.total || 0}
          icon={<Mail size={20} />}
          color="var(--accent)"
          loading={statsLoading}
          onClick={() => navigate('/assistant/inbox')}
        />
        <StatsCard
          label="Unread"
          value={stats?.unread || 0}
          icon={<MailCheck size={20} />}
          color="#3B82F6"
          loading={statsLoading}
          onClick={() => navigate('/assistant/inbox?filter=unread')}
        />
        <StatsCard
          label="Important"
          value={stats?.important || 0}
          icon={<Star size={20} />}
          color="#F59E0B"
          loading={statsLoading}
          onClick={() => navigate('/assistant/category/important')}
        />
        <StatsCard
          label="Action Required"
          value={stats?.actionRequired || 0}
          icon={<AlertCircle size={20} />}
          color="#EF4444"
          loading={statsLoading}
          onClick={() => navigate('/assistant/category/action_required')}
        />
        <StatsCard
          label="Asst. to Reply"
          value={stats?.assistantToReply || 0}
          icon={<Reply size={20} />}
          color="#6366F1"
          loading={statsLoading}
          onClick={() => navigate('/assistant/category/ASSISTANT_TO_REPLY')}
        />
        <StatsCard
          label="Client to Reply"
          value={stats?.clientToReply || 0}
          icon={<User size={20} />}
          color="#D97706"
          loading={statsLoading}
          onClick={() => navigate('/assistant/category/CLIENT_TO_REPLY')}
        />
      </div>

      {/* Main 2-column content layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Recent Conversations */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-h)', margin: 0 }}>
                  Recent Conversations
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-m)' }}>
                  (Latest 10)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowRight size={14} />}
                onClick={() => navigate('/assistant/inbox')}
              >
                View all in Inbox
              </Button>
            </div>

            <EmailList
              conversations={recentConversations}
              isLoading={conversationsLoading}
              onToggleStar={handleToggleStar}
              onToggleArchive={handleToggleArchive}
              onToggleRead={handleToggleRead}
            />
          </div>
        </div>

        {/* Right column: Upcoming Meetings & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="dashboard-side">
          {/* Upcoming Meetings */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)', margin: 0 }}>
                  Upcoming Meetings
                </h3>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--accent-lt)',
                  color: 'var(--accent)',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  fontWeight: 600,
                }}
              >
                AI Detected
              </span>
            </div>

            {meetingsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Skeleton height={40} />
                <Skeleton height={40} />
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-m)', margin: 0 }}>
                No upcoming meetings detected in current threads.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingMeetings.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => navigate(`/assistant/conversations/${conv._id}`)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>
                      {conv.subject}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-m)', marginTop: '2px' }}>
                      With: {conv.participants?.[0]?.name || 'Participant'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Notifications */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Bell size={18} color="var(--warning)" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)', margin: 0 }}>
                Recent Activity & Alerts
              </h3>
            </div>

            {notifLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Skeleton height={30} />
                <Skeleton height={30} />
              </div>
            ) : notifications.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-m)', margin: 0 }}>
                No recent notifications.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((n, i) => (
                  <div key={n._id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: !n.isRead ? 'var(--accent)' : 'var(--text-m)',
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: !n.isRead ? 600 : 400, color: 'var(--text-h)' }}>
                        {n.title || n.message || 'Notification'}
                      </div>
                      {n.body && (
                        <div style={{ fontSize: '12px', color: 'var(--text-m)', marginTop: '2px' }}>
                          {n.body}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(min-width: 1100px) {
          .dashboard-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
