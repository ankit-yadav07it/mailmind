export default function EmptyState({ icon, title, description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.7 }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-h)', marginBottom: 8 }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 14, color: 'var(--text-m)', maxWidth: 320, marginBottom: 20, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
