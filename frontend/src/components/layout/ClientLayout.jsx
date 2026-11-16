import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ClientLayout() {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        height: 64,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>✦ MailMind</span>
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-m)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 100,
            padding: '2px 10px',
          }}>
            Client View
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: 'var(--text-m)' }}>{user?.name}</span>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--text-b)',
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
