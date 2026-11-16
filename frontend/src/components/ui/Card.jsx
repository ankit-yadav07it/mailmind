import clsx from 'clsx';

const PADDING = {
  none: '0',
  sm: '12px',
  md: '20px',
  lg: '28px',
};

export default function Card({ children, className, hover = false, padding = 'md', style, onClick }) {
  return (
    <div
      onClick={onClick}
      className={clsx('card', className)}
      style={{
        padding: PADDING[padding] || PADDING.md,
        transition: hover ? 'box-shadow var(--transition), transform var(--transition)' : undefined,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      } : undefined}
    >
      {children}
    </div>
  );
}
