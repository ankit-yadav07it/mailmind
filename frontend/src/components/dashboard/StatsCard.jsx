import Skeleton from '../ui/Skeleton';

export default function StatsCard({ label, value, icon, color = 'var(--accent)', trend, loading = false, onClick }) {
  if (loading) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width={80} height={14} />
          <Skeleton width={36} height={36} circle />
        </div>
        <Skeleton width={60} height={28} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderBottom: `3px solid ${color}`,
        borderRadius: 'var(--radius)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform var(--transition), box-shadow var(--transition)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-m)' }}>
          {label}
        </span>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', lineHeight: 1 }}>
          {value != null ? value : 0}
        </span>
        {trend && (
          <span style={{ fontSize: '12px', color: 'var(--text-m)' }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
