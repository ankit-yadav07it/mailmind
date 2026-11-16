export default function Skeleton({ width, height, className, circle = false }) {
  return (
    <div
      className={className}
      style={{
        width: width || '100%',
        height: height || 16,
        borderRadius: circle ? '50%' : 8,
        background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease infinite',
        flexShrink: 0,
      }}
    >
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}
