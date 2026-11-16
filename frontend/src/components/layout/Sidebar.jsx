import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Mail, Reply, User, AlertCircle, Clock,
  Calendar, Star, CheckCircle, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/assistant/dashboard' },
  { label: 'Inbox', icon: Mail, path: '/assistant/inbox', countKey: 'total' },
  { label: 'Assistant to Reply', icon: Reply, path: '/assistant/category/ASSISTANT_TO_REPLY', countKey: 'assistantToReply' },
  { label: 'Client to Reply', icon: User, path: '/assistant/category/CLIENT_TO_REPLY', countKey: 'clientToReply' },
  { label: 'Action Required', icon: AlertCircle, path: '/assistant/category/action_required', countKey: 'actionRequired' },
  { label: 'Waiting', icon: Clock, path: '/assistant/category/waiting', countKey: 'waitingForResponse' },
  { label: 'Meetings', icon: Calendar, path: '/assistant/category/meetings', countKey: 'upcomingMeetings' },
  { label: 'Important', icon: Star, path: '/assistant/category/important' },
  { label: 'No Reply Needed', icon: CheckCircle, path: '/assistant/category/NO_REPLY_NEEDED' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { stats } = useDashboardStats();
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        minHeight: '100vh',
        background: 'var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        height: 64,
      }}>
        {!collapsed && (
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
            ✦ MailMind
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ label, icon: Icon, path, countKey }) => {
          const count = countKey && stats ? stats[countKey] : null;
          return (
            <NavLink
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '10px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(79,124,255,0.25)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'background var(--transition), color var(--transition)',
                position: 'relative',
              })}
            >
              <Icon size={18} />
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{label}</span>
                  {count != null && count > 0 && (
                    <span style={{
                      background: 'var(--accent)',
                      color: '#fff',
                      borderRadius: '100px',
                      padding: '1px 7px',
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: user + logout */}
      <div style={{
        padding: collapsed ? '12px 0' : '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <Avatar name={user?.name || 'U'} size="sm" />
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                {user?.role}
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
                borderRadius: 6,
              }}
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
