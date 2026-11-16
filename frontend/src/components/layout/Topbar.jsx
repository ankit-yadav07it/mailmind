import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, LogOut, Settings, User } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';

export default function Topbar({ onMenuToggle, title }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const dropRef = useRef(null);

  useEffect(() => {
    notificationService.getNotifications()
      .then((res) => {
        const list = res.data?.notifications || res.data || [];
        setNotifCount(list.filter(n => !n.isRead).length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header style={{
      height: 64,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuToggle}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-b)',
          alignItems: 'center',
          padding: 4,
        }}
        className="mobile-menu-btn"
      >
        <Menu size={22} />
      </button>

      {/* Title */}
      <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-h)', flex: '0 0 auto' }}>
        {title}
      </h1>

      {/* Search (desktop) */}
      <div style={{ flex: 1, maxWidth: 400, margin: '0 16px' }} className="desktop-search">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-m)',
          }} />
          <input
            placeholder="Search emails..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              background: 'var(--bg)',
              color: 'var(--text-b)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        {/* Notifications */}
        <button style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-m)',
          display: 'flex',
          alignItems: 'center',
          padding: 8,
          borderRadius: 8,
        }}>
          <Bell size={20} />
          {notifCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: 'var(--danger)',
              color: '#fff',
              borderRadius: '50%',
              width: 16,
              height: 16,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {notifCount}
            </span>
          )}
        </button>

        {/* Avatar + dropdown */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 4 }}
          >
            <Avatar name={user?.name || 'U'} size="sm" />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              minWidth: 180,
              zIndex: 200,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-m)' }}>{user?.email}</div>
              </div>
              {[
                { icon: User, label: 'Profile', action: () => {} },
                { icon: Settings, label: 'Settings', action: () => { window.location.href='/assistant/settings'; } },
                { icon: LogOut, label: 'Logout', action: logout, danger: true },
              ].map(({ icon: Icon, label, action, danger }) => (
                <button
                  key={label}
                  onClick={() => { setDropdownOpen(false); action(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: danger ? 'var(--danger)' : 'var(--text-b)',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .desktop-search { display: none !important; }
        }
      `}</style>
    </header>
  );
}
