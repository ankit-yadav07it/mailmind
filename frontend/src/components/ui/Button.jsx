import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const SIZE_CLASSES = {
  sm: { padding: '6px 14px', fontSize: '12px', gap: '6px' },
  md: { padding: '10px 20px', fontSize: '14px', gap: '8px' },
  lg: { padding: '12px 28px', fontSize: '16px', gap: '8px' },
};

const VARIANT_STYLES = {
  primary: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--accent)',
    border: '1.5px solid var(--accent)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-b)',
    border: 'none',
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
    border: 'none',
  },
  success: {
    background: 'var(--success)',
    color: '#fff',
    border: 'none',
  },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  style,
  ...rest
}) {
  const sizeStyle = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizeStyle.gap,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: 500,
        borderRadius: 'var(--radius-sm)',
        cursor: rest.disabled || loading ? 'not-allowed' : 'pointer',
        opacity: rest.disabled || loading ? 0.6 : 1,
        transition: 'background var(--transition), transform var(--transition)',
        fontFamily: 'inherit',
        lineHeight: 1,
        ...variantStyle,
        ...style,
      }}
      className={className}
      disabled={rest.disabled || loading}
      {...rest}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} style={{ animation: 'spin 1s linear infinite' }} />
      ) : icon ? (
        icon
      ) : null}
      {children}
      <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </button>
  );
}
