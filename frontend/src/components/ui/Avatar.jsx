const COLORS = [
  '#4F7CFF', '#16A34A', '#D97706', '#DC2626',
  '#7C3AED', '#0891B2', '#BE185D', '#D97706',
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const SIZES = {
  sm: { width: 28, height: 28, fontSize: 11 },
  md: { width: 36, height: 36, fontSize: 14 },
  lg: { width: 48, height: 48, fontSize: 18 },
};

export default function Avatar({ name = '', size = 'md', src }) {
  const dim = SIZES[size] || SIZES.md;
  const color = COLORS[hashCode(name) % COLORS.length];
  const letter = (name || '?')[0].toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: dim.width,
          height: dim.height,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: dim.width,
        height: dim.height,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: dim.fontSize,
        fontWeight: 600,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {letter}
    </div>
  );
}
