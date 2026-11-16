import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PAGE_TITLES = {
  '/assistant/dashboard': 'Dashboard',
  '/assistant/inbox': 'Inbox',
  '/assistant/replies': 'Reply Drafts',
  '/assistant/settings': 'Settings',
};

function getTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.includes('/category/')) return 'Category';
  if (pathname.includes('/conversations/')) return 'Conversation';
  return 'MailMind';
}

export default function AssistantLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 50, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar - hidden on mobile unless mobileOpen */}
      <div
        className={`sidebar-wrapper ${mobileOpen ? 'mobile-open' : ''}`}
        style={{ position: 'relative' }}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(v => !v)}
        />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          onMenuToggle={() => setMobileOpen(v => !v)}
          title={getTitle(location.pathname)}
        />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-wrapper {
            position: fixed !important;
            left: -260px;
            top: 0;
            height: 100vh;
            z-index: 60;
            transition: left 0.25s ease;
          }
          .sidebar-wrapper.mobile-open {
            left: 0 !important;
          }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}
